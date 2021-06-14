import {
  put,
  takeLatest,
  takeLeading,
  race,
  delay,
  take,
  call,
} from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';

import { Next, compose } from './create-api';
import {
  Action,
  ActionWithPayload,
  CreateActionPayload,
  QueryCtx,
} from './types';
import { isObject } from './util';

export function* queryCtx<Ctx extends QueryCtx = QueryCtx>(
  ctx: Ctx,
  next: Next,
) {
  if (!ctx.request) ctx.request = { url: '', method: 'GET' };
  if (!ctx.response) ctx.response = {};
  if (!ctx.actions) ctx.actions = [];
  yield next();
}

export function* urlParser<Ctx extends QueryCtx = QueryCtx>(
  ctx: Ctx,
  next: Next,
) {
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

export function loadingTracker<Ctx extends QueryCtx = QueryCtx>(
  loaders: {
    actions: {
      loading: (l: { id: string }) => any;
      error: (l: { id: string; message: string }) => any;
      success: (l: { id: string }) => any;
    };
  },
  errorFn: (ctx: Ctx) => string = (ctx) => ctx.response.data.message,
) {
  return function* trackLoading(ctx: Ctx, next: Next) {
    const id = ctx.name;
    yield put(loaders.actions.loading({ id }));

    yield next();

    if (!ctx.response.ok) {
      yield put(loaders.actions.error({ id, message: errorFn(ctx) }));
      return;
    }

    yield put(loaders.actions.success({ id }));
  };
}

export interface UndoCtx<A extends Action = any, R extends Action = any>
  extends QueryCtx {
  undo: {
    apply: A;
    revert: R;
  };
}

export const undo = () => ({
  type: 'undo',
});
export function* undoer(timer: number = 5 * 1000, undoType = `${undo}`) {
  return function* onUndo<Ctx extends UndoCtx<any, any> = UndoCtx<any, any>>(
    ctx: Ctx,
    next: Next,
  ): SagaIterator<void> {
    if (!ctx.undo) yield next();
    const { apply, revert } = ctx.undo;

    yield put(apply);

    const winner = yield race({
      timer: delay(timer),
      undo: take(`${undoType}`),
    });

    if (winner.undo) {
      yield put(revert);
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
  extends QueryCtx {
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
