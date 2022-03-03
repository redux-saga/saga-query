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
} from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import type {
  Action,
  ApiCtx,
  Next,
  PipeCtx,
  ApiRequest,
  RequiredApiRequest,
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
    const id = ctx.name;
    yield put(setLoaderStart({ id }));
    if (!ctx.loader) ctx.loader = {} as any;

    yield next();

    if (!ctx.response) {
      ctx.actions.push(resetLoaderById(id));
      return;
    }

    const payload = ctx.loader || {};
    if (!ctx.response.ok) {
      ctx.actions.push(
        setLoaderError({ id, message: errorFn(ctx), ...payload }),
      );
      return;
    }

    ctx.actions.push(setLoaderSuccess({ id, ...payload }));
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

export function createThrottle(ms: number) {
  return function* (action: string, saga: any, ...args: any[]) {
    yield throttleHelper(ms, `${action}`, saga, ...args);
  };
}

export function createDebounce(ms: number) {
  return function* (action: string, saga: any, ...args: any[]) {
    yield debounceHelper(ms, `${action}`, saga, ...args);
  };
}

export function timer(timer: number) {
  return function* onTimer(
    type: string,
    saga: any,
    ...args: any[]
  ): SagaIterator<void> {
    while (true) {
      const action = yield take(`${type}`);
      yield call(saga, action, ...args);
      yield delay(timer);
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
