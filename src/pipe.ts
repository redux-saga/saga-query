import { call, takeEvery } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { sagaCreator } from './store';
import { isFn, isObject } from './util';
import { createKey } from './create-key';
import type {
  Middleware,
  MiddlewareCo,
  Next,
  ActionWithPayload,
  CreateAction,
  CreateActionWithPayload,
  PipeCtx,
} from './types';
import { API_ACTION_PREFIX } from './constant';
import { compose } from './compose';

export interface SagaApi<Ctx extends PipeCtx> {
  saga: () => (...options: any[]) => SagaIterator<void>;
  use: (fn: Middleware<Ctx>) => void;
  routes: () => Middleware<Ctx>;

  create(name: string): CreateAction<Ctx>;
  create<P>(name: string): CreateActionWithPayload<Ctx, P>;
  create(name: string, req: { saga?: any }): CreateAction<Ctx>;
  create<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  create(name: string, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  create<P>(
    name: string,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  create(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  create<P>(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
}

export const defaultOnError = (err: Error) => {
  throw err;
};

/**
 * Creates a middleware pipeline.
 *
 * @remarks
 * This middleware pipeline is almost exactly like koa's middleware system.
 * See {@link https://koajs.com}
 *
 * @example
 * ```ts
 * import { createPipe } from 'saga-query';
 *
 * const thunk = createPipe();
 * thunk.use(function* (ctx, next) {
 *   console.log('beginning');
 *   yield next();
 *   console.log('end');
 * });
 * thunks.use(thunks.routes());
 *
 * const doit = thunk.create('do-something', function*(ctx, next) {
 *   console.log('middle');
 *   yield next();
 *   console.log('middle end');
 * });
 *
 * // ...
 *
 * store.dispatch(doit());
 * // beginning
 * // middle
 * // middle end
 * // end
 * ```
 */
export function createPipe<Ctx extends PipeCtx = PipeCtx<any>>({
  saga = takeEvery,
  onError = defaultOnError,
}: {
  saga?: (...args: any[]) => any;
  onError?: (err: Error) => any;
} = {}): SagaApi<Ctx> {
  const middleware: Middleware<Ctx>[] = [];
  const sagas: { [key: string]: any } = {};
  const middlewareMap: { [key: string]: Middleware<Ctx> } = {};
  const actionMap: {
    [key: string]: CreateActionWithPayload<Ctx, any>;
  } = {};

  function* defaultMiddleware(_: Ctx, next: Next): SagaIterator<void> {
    yield next();
  }

  const createType = (post: string) => `${API_ACTION_PREFIX}${post}`;

  function* onApi(action: ActionWithPayload<any>): SagaIterator<Ctx> {
    const { name, key, options } = action.payload;
    const actionFn = actionMap[name];
    const ctx: any = {
      action,
      name,
      key,
      payload: options,
      actionFn,
    };
    const fn = compose(middleware);
    yield call(fn, ctx);
    return ctx;
  }

  function create(createName: string, ...args: any[]) {
    const type = createType(createName);
    const action = (payload?: any) => {
      return { type, payload };
    };
    action.toString = () => `${type}`;
    let req = null;
    let fn = null;
    if (args.length === 2) {
      req = args[0];
      fn = args[1];
    }

    if (args.length === 1) {
      if (isFn(args[0]) || Array.isArray(args[0])) {
        fn = args[0];
      } else {
        req = args[0];
      }
    }

    if (req && !isObject(req)) {
      throw new Error('Options must be an object');
    }

    if (fn && Array.isArray(fn)) {
      fn = compose(fn);
    }

    if (fn && !isFn(fn)) {
      throw new Error('Middleware must be a function');
    }

    middlewareMap[`${createName}`] = fn || defaultMiddleware;

    const tt = req ? (req as any).saga : saga;
    function* curSaga(): SagaIterator<void> {
      yield tt(`${action}`, onApi);
    }
    sagas[`${createName}`] = curSaga;

    const actionFn = (options?: any) => {
      const key = createKey(createName, options);
      return action({ name: createName, key, options });
    };
    actionFn.run = onApi as any;
    actionFn.toString = () => createName;
    actionMap[`${createName}`] = actionFn;
    return actionFn;
  }

  function routes() {
    function* router(ctx: Ctx, next: Next): SagaIterator<void> {
      const match = middlewareMap[ctx.name];
      if (!match) {
        yield next();
        return;
      }

      yield call(match, ctx, next);
    }

    return router;
  }

  return {
    saga: () => sagaCreator(sagas, onError),
    use: (fn: Middleware<Ctx>) => {
      middleware.push(fn);
    },
    create,
    routes,
  };
}
