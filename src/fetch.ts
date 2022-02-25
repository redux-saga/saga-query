import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { compose } from './pipe';
import type { FetchCtx, FetchJsonCtx, Next } from './types';

export function* headersMdw<CurCtx extends FetchCtx = FetchCtx>(
  ctx: CurCtx,
  next: Next,
): SagaIterator<any> {
  if (!ctx.request) {
    yield next();
    return;
  }

  if (!ctx.request.headers.has('Content-Type')) {
    ctx.request.headers.set('Content-Type', 'application/json');
  }

  yield next();
}

export function* fetchMdw<CurCtx extends FetchCtx = FetchCtx>(
  ctx: CurCtx,
  next: Next,
): SagaIterator<any> {
  const response: Response = yield call(fetch, ctx.request);
  ctx.response = response;
  yield next();
}

export function* jsonMdw<CurCtx extends FetchJsonCtx = FetchJsonCtx>(
  ctx: CurCtx,
  next: Next,
): SagaIterator<any> {
  if (!ctx.response) {
    yield next();
    return;
  }

  if (ctx.response.status === 204) {
    ctx.json = {
      ok: ctx.response.ok,
      data: {},
    };
    yield next();
    return;
  }

  const data = yield call([ctx.response, 'json']);
  ctx.json = {
    ok: ctx.response.ok,
    data,
  };

  yield next();
}

export function fetcher<CurCtx extends FetchJsonCtx = FetchJsonCtx>() {
  return compose<CurCtx>([headersMdw, fetchMdw, jsonMdw]);
}
