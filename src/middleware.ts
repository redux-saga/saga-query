import { batchActions } from 'redux-batched-actions';
import {
  put,
  takeLatest,
  takeLeading,
  race,
  delay,
  take,
  call,
} from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import type { Action, ApiCtx, Next, PipeCtx } from './types';
import { compose } from './pipe';
import { isObject, createAction } from './util';
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
  if (!ctx.request) ctx.request = { url: '', method: 'GET' };
  if (!ctx.response) ctx.response = {};
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

  if (!ctx.request) throw new Error('ctx.request does not exist');
  if (!ctx.request.url) {
    let url = Object.keys(options).reduce((acc, key) => {
      return acc.replace(`:${key}`, options[key]);
    }, ctx.name);

    url = httpMethods.reduce((acc, method) => {
      const pattern = new RegExp(`\\s*\\[` + method + `\\]\\s*`, 'i');
      const result = acc.replace(pattern, '');
      if (result.length !== acc.length) {
        ctx.request.method = method.toLocaleUpperCase();
      }
      return result;
    }, url);
    ctx.request.url = url;
  }

  // TODO: should this be a separate middleware?
  if (!ctx.request.body && ctx.request.data) {
    ctx.request.body = {
      body: JSON.stringify(ctx.request.data),
    };
  }

  if (!ctx.request.method) {
    httpMethods.forEach((method) => {
      const url = ctx.request.url || '';
      const pattern = new RegExp(`\\s*\\[` + method + `\\]\\s*`, 'i');
      const result = url.replace(pattern, '');
      if (result.length !== url.length) {
        ctx.request.method = method.toLocaleUpperCase();
      }
    });
  }

  yield next();
}

export function* dispatchActions(ctx: { actions: Action[] }, next: Next) {
  yield next();
  if (ctx.actions.length === 0) return;
  yield put(batchActions(ctx.actions));
}

export function loadingMonitor<Ctx extends ApiCtx = ApiCtx>(
  errorFn: (ctx: Ctx) => string = (ctx) => ctx.response?.data?.message || '',
) {
  return function* trackLoading(ctx: Ctx, next: Next) {
    const id = ctx.name;
    yield put(setLoaderStart({ id }));
    if (!ctx.loader) ctx.loader = {} as any;

    yield next();

    if (typeof ctx.response.ok === 'undefined') {
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

export interface UndoCtx<R = any, P = any> extends ApiCtx<R, P> {
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

  if (!ctx.response.ok) {
    yield put(revert);
  }
}

export function* simpleCache<Ctx extends ApiCtx = ApiCtx>(
  ctx: Ctx,
  next: Next,
) {
  yield next();
  if (!ctx.request.simpleCache) return;
  const { data } = ctx.response;
  const key = ctx.key;
  ctx.actions.push(addData({ [key]: data }));
}

export function requestMonitor<Ctx extends ApiCtx = ApiCtx>(
  errorFn?: (ctx: Ctx) => string,
) {
  return compose<Ctx>([
    errorHandler,
    queryCtx,
    dispatchActions,
    loadingMonitor(errorFn),
  ]);
}

export function requestParser<Ctx extends ApiCtx = ApiCtx>() {
  return compose<Ctx>([urlParser, simpleCache]);
}
