import { put, takeLatest, race, delay, take } from 'redux-saga/effects';

import { Next, compose } from './create-api';
import { ActionWithPayload, CreateActionPayload, QueryCtx } from './types';

export function* queryCtx<Ctx extends QueryCtx = QueryCtx>(
  ctx: Ctx,
  next: Next,
) {
  if (!ctx.request) ctx.request = { url: '' };
  if (!ctx.response) ctx.response = {};
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

  const { options = {} } = ctx.payload;
  if (!ctx.request) throw new Error('ctx.request does not exist');
  if (!ctx.request.url) {
    let url = Object.keys(options).reduce((acc, key) => {
      return acc.replace(`:${key}`, options[key]);
    }, ctx.payload.name);

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
  successFn: (ctx: Ctx) => boolean = (ctx) => ctx.response.ok,
  errorFn: (ctx: Ctx) => string = (ctx) => ctx.response.data.message,
) {
  return function* trackLoading(ctx: Ctx, next: Next) {
    const id = ctx.payload.name;
    yield put(loaders.actions.loading({ id }));
    yield next();
    if (!successFn(ctx)) {
      yield put(loaders.actions.error({ id, message: errorFn(ctx) }));
      return;
    }
    yield put(loaders.actions.success({ id }));
  };
}

export function* latest(action: string, saga: any, ...args: any[]) {
  yield takeLatest(`${action}`, saga, ...args);
}

export interface UndoCtx extends QueryCtx {
  undo: {
    apply: ActionWithPayload<any>;
    revert: ActionWithPayload<any>;
  };
}

export const undo = () => ({
  type: 'undo',
});
export function* undoer(ctx: UndoCtx, next: Next): Generator<any, any, any> {
  if (!ctx.undo) yield next();
  const { apply, revert } = ctx.undo;

  // first optimistically set the message to archived
  yield put(apply);

  // race between a timer and the undo action
  const winner = yield race({
    timer: delay(5 * 1000),
    undo: take(`${undo}`),
  });

  // if the undo action was dispatched within the timer window, revert
  // archived
  if (winner.undo) {
    yield put(revert);
    return;
  }

  yield next();
}
