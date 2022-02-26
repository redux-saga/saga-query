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

  const cur = ctx.req();
  if (!cur.headers.hasOwnProperty('Content-Type')) {
    ctx.request = ctx.req({
      headers: { 'Content-Type': 'application/json' },
    });
  }

  yield next();
}

export function* fetchMdw<CurCtx extends FetchCtx = FetchCtx>(
  ctx: CurCtx,
  next: Next,
): SagaIterator<any> {
  const { url, ...req } = ctx.req();
  const request = new Request(url, req);
  const response: Response = yield call(fetch, request);
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

  try {
    const data = yield call([ctx.response, 'json']);
    ctx.json = {
      ok: ctx.response.ok,
      data,
    };
  } catch (err: any) {
    ctx.json = {
      ok: false,
      data: { message: err.message },
    };
  }

  yield next();
}

export function fetcher<CurCtx extends FetchJsonCtx = FetchJsonCtx>() {
  return compose<CurCtx>([headersMdw, fetchMdw, jsonMdw]);
}
