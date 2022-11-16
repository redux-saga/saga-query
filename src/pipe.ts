import { call, takeEvery } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { sagaCreator } from './store';
import { isFn, isObject } from './util';
import { createActionKey } from './create-key';
import type {
  Middleware,
  MiddlewareCo,
  Next,
  ActionWithPayload,
  CreateAction,
  CreateActionWithPayload,
  PipeCtx,
} from './types';
import { API_ACTION_PREFIX } from './constants';

export function compose<Ctx extends PipeCtx = PipeCtx>(
  middleware: Middleware<Ctx>[],
) {
  if (!Array.isArray(middleware)) {
    throw new TypeError('Middleware stack must be an array!');
  }
  for (const fn of middleware) {
    if (typeof fn !== 'function') {
      throw new TypeError('Middleware must be composed of functions!');
    }
  }

  return function* composeSaga(context: Ctx, next?: Next): SagaIterator<void> {
    // last called middleware #
    let index = -1;
    yield call(dispatch, 0);

    function* dispatch(i: number): SagaIterator<void> {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;
      let fn: any = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return;
      yield call(fn, context, dispatch.bind(null, i + 1));
    }
  };
}

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
      const key = createActionKey(createName, options);
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
