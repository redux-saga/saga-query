import { batchActions } from 'redux-batched-actions';
import {
  put,
  takeLatest,
  takeLeading,
  race,
  delay,
  take,
  call,
  throttle as throttleHelper,
  debounce as debounceHelper,
  fork,
} from 'redux-saga/effects';
import type { SagaIterator, Task } from 'redux-saga';

import type {
  Action,
  ApiCtx,
  Next,
  PipeCtx,
  ApiRequest,
  RequiredApiRequest,
  ActionWithPayload,
  CreateActionPayload,
} from './types';
import { compose } from './pipe';
import { isObject, createAction, mergeRequest } from './util';
import {
  setLoaderStart,
  setLoaderError,
  setLoaderSuccess,
  resetLoaderById,
  addData,
} from './slice';

const MS = 1000;
const SECONDS = 1 * MS;
const MINUTES = 60 * SECONDS;

export function* errorHandler<Ctx extends PipeCtx = PipeCtx>(
  ctx: Ctx,
  next: Next,
) {
  try {
    yield next();
  } catch (err: any) {
    console.error(
      `Error: ${err.message}.  Check the endpoint [${ctx.name}]`,
      ctx,
    );
    throw err;
  }
}

export function* queryCtx<Ctx extends ApiCtx = ApiCtx>(ctx: Ctx, next: Next) {
  if (!ctx.req) {
    ctx.req = (r?: ApiRequest): RequiredApiRequest =>
      mergeRequest(ctx.request, r);
  }
  if (!ctx.request) ctx.request = ctx.req();
  if (!ctx.response) ctx.response = null;
  if (!ctx.json) ctx.json = { ok: false, data: {} };
  if (!ctx.actions) ctx.actions = [];
  yield next();
}

export function* urlParser<Ctx extends ApiCtx = ApiCtx>(ctx: Ctx, next: Next) {
  const httpMethods = [
    'get',
    'head',
    'post',
    'put',
    'delete',
    'connect',
    'options',
    'trace',
    'patch',
  ];

  const options = ctx.payload || {};
  if (!isObject(options)) {
    yield next();
    return;
  }

  let url = Object.keys(options).reduce((acc, key) => {
    return acc.replace(`:${key}`, options[key]);
  }, ctx.name);

  let method = '';
  httpMethods.forEach((curMethod) => {
    const pattern = new RegExp(`\\s*\\[` + curMethod + `\\]\\s*`, 'i');
    const tmpUrl = url.replace(pattern, '');
    if (tmpUrl.length !== url.length) {
      method = curMethod.toLocaleUpperCase();
    }
    url = tmpUrl;
  }, url);

  ctx.request = ctx.req({ url });
  if (method) {
    ctx.request = ctx.req({ method });
  }

  yield next();
}

export function* dispatchActions(ctx: { actions: Action[] }, next: Next) {
  if (!ctx.actions) ctx.actions = [];
  yield next();
  if (ctx.actions.length === 0) return;
  yield put(batchActions(ctx.actions));
}

export function loadingMonitor<Ctx extends ApiCtx = ApiCtx>(
  errorFn: (ctx: Ctx) => string = (ctx) => ctx.json?.data?.message || '',
) {
  return function* trackLoading(ctx: Ctx, next: Next) {
    yield put(
      batchActions([
        setLoaderStart({ id: ctx.name }),
        setLoaderStart({ id: ctx.key }),
      ]),
    );
    if (!ctx.loader) ctx.loader = {} as any;

    yield next();

    if (!ctx.response) {
      ctx.actions.push(resetLoaderById(ctx.name), resetLoaderById(ctx.key));
      return;
    }

    const payload = ctx.loader || {};
    if (!ctx.response.ok) {
      ctx.actions.push(
        setLoaderError({ id: ctx.name, message: errorFn(ctx), ...payload }),
        setLoaderError({ id: ctx.key, message: errorFn(ctx), ...payload }),
      );
      return;
    }

    ctx.actions.push(
      setLoaderSuccess({ id: ctx.name, ...payload }),
      setLoaderSuccess({ id: ctx.key, ...payload }),
    );
  };
}

export interface UndoCtx<P = any, S = any, E = any> extends ApiCtx<P, S, E> {
  undoable: boolean;
}

export const doIt = createAction('DO_IT');
export const undo = createAction('UNDO');
export function undoer<Ctx extends UndoCtx = UndoCtx>(
  doItType = `${doIt}`,
  undoType = `${undo}`,
  timeout = 30 * 1000,
) {
  return function* onUndo(ctx: Ctx, next: Next): SagaIterator<void> {
    if (!ctx.undoable) {
      yield next();
      return;
    }

    const winner = yield race({
      doIt: take(`${doItType}`),
      undo: take(`${undoType}`),
      timeout: delay(timeout),
    });

    if (winner.undo || winner.timeout) {
      return;
    }

    yield next();
  };
}

export function* latest(action: string, saga: any, ...args: any[]) {
  yield takeLatest(`${action}`, saga, ...args);
}

export function* leading(action: string, saga: any, ...args: any[]) {
  yield takeLeading(`${action}`, saga, ...args);
}

export function createThrottle(ms: number = 5 * SECONDS) {
  return function* (action: string, saga: any, ...args: any[]) {
    yield throttleHelper(ms, `${action}`, saga, ...args);
  };
}

export function createDebounce(ms: number = 5 * SECONDS) {
  return function* (action: string, saga: any, ...args: any[]) {
    yield debounceHelper(ms, `${action}`, saga, ...args);
  };
}

/*
 * This function will create a cache timer for each `key` inside
 * of a saga-query api endpoint.  `key` is a hash of the action type and payload.
 *
 * Why do we want this?  If we have an api endpoint to fetch a single app: `fetchApp({ id: 1 })`
 * if we don't set a timer per key then all calls to `fetchApp` will be on a timer.
 * So if we call `fetchApp({ id: 1 })` and then `fetchApp({ id: 2 })` if we use a normal
 * cache timer then the second call will not send an http request.
 */
export function timer(timer: number = 5 * MINUTES) {
  return function* onTimer(
    actionType: string,
    saga: any,
    ...args: any[]
  ): SagaIterator<void> {
    const map: { [key: string]: Task } = {};

    function* activate(action: ActionWithPayload<CreateActionPayload>) {
      yield call(saga, action, ...args);
      yield delay(timer);
      delete map[action.payload.key];
    }

    while (true) {
      const action: ActionWithPayload<CreateActionPayload> = yield take(
        `${actionType}`,
      );
      const key = action.payload.key;
      const notRunning = map[key] && !map[key].isRunning();
      if (!map[key] || notRunning) {
        const task = yield fork(activate, action);
        map[key] = task;
      }
    }
  };
}

export function poll(parentTimer?: number, cancelType?: string) {
  return function* poller(
    actionType: string,
    saga: any,
    ...args: any[]
  ): SagaIterator<void> {
    const cancel = cancelType || actionType;
    function* fire(action: { type: string }, timer: number) {
      while (true) {
        yield call(saga, action, ...args);
        yield delay(timer);
      }
    }

    while (true) {
      const action = yield take(`${actionType}`);
      const timer = action.payload?.timer || parentTimer;
      yield race([call(fire, action, timer), take(`${cancel}`)]);
    }
  };
}

export interface OptimisticCtx<A extends Action = any, R extends Action = any>
  extends ApiCtx {
  optimistic: {
    apply: A;
    revert: R;
  };
}

export function* optimistic<
  Ctx extends OptimisticCtx<any, any> = OptimisticCtx<any, any>,
>(ctx: Ctx, next: Next) {
  if (!ctx.optimistic) {
    yield next();
    return;
  }

  const { apply, revert } = ctx.optimistic;
  // optimistically update user
  yield put(apply);

  yield next();

  if (!ctx.response || !ctx.response.ok) {
    yield put(revert);
  }
}

export function* simpleCache<Ctx extends ApiCtx = ApiCtx>(
  ctx: Ctx,
  next: Next,
) {
  yield next();
  if (!ctx.cache) return;
  const { data } = ctx.json;
  const key = ctx.key;
  ctx.actions.push(addData({ [key]: data }));
}

export function requestMonitor<Ctx extends ApiCtx = ApiCtx>(
  errorFn?: (ctx: Ctx) => string,
) {
  return compose<Ctx>([
    errorHandler,
    queryCtx,
    urlParser,
    dispatchActions,
    loadingMonitor(errorFn),
    simpleCache,
  ]);
}

export interface PerfCtx<P = any> extends PipeCtx<P> {
  performance: number;
}

export function* performanceMonitor<Ctx extends PerfCtx = PerfCtx>(
  ctx: Ctx,
  next: Next,
) {
  const t0 = performance.now();
  yield next();
  const t1 = performance.now();
  ctx.performance = t1 - t0;
}

export function wrap<Ctx extends PipeCtx = PipeCtx>(
  saga: (...args: any[]) => any,
) {
  return function* (ctx: Ctx, next: Next) {
    yield call(saga, ctx.action);
    yield next();
  };
}
