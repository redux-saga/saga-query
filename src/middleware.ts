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

import { compose } from './pipe';
import {
  Action,
  ActionWithPayload,
  CreateActionPayload,
  ApiCtx,
  Next,
} from './types';
import { isObject } from './util';

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

export function loadingTracker<Ctx extends ApiCtx = ApiCtx>(
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

interface UndoCtx<R = any, P = any> extends ApiCtx {
  undoable: boolean;
}

export const doIt = () => {
  const type = '@@saga-query/DO_IT';
  const action = { type };
  action.toString = () => type;
};
export const undo = () => {
  const type = '@@saga-query/UNDO';
  const action = { type };
  action.toString = () => type;
};
function undoer<Ctx extends UndoCtx = UndoCtx>(
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
