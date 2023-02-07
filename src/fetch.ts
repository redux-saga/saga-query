import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { compose } from './compose';
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

export function apiUrlMdw<CurCtx extends FetchJsonCtx = FetchJsonCtx>(
  baseUrl: string = '',
) {
  return function* (ctx: CurCtx, next: Next): SagaIterator<any> {
    const req = ctx.req();
    ctx.request = ctx.req({ url: `${baseUrl}${req.url}` });
    yield next();
  };
}

/**
 * If there's a slug inside the ctx.name (which is the URL segement in this case)
 * and there is *not* a corresponding truthy value in the payload, then that means
 * the user has an empty value (e.g. empty string) which means we want to abort the
 * fetch request.
 *
 * e.g. `ctx.name = "/apps/:id"` with `payload = { id: '' }`
 *
 * Ideally the action wouldn't have been dispatched at all but that is *not* a
 * gaurantee we can make here.
 */
export function* payloadMdw<CurCtx extends FetchJsonCtx = FetchJsonCtx>(
  ctx: CurCtx,
  next: Next,
) {
  const payload = ctx.payload;
  if (!payload) {
    yield next();
    return;
  }

  const keys = Object.keys(payload);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (!ctx.name.includes(`:${key}`)) {
      continue;
    }

    const val = payload[key];
    if (!val) {
      ctx.json = {
        ok: false,
        data: `found :${key} in endpoint name (${ctx.name}) but payload has falsy value (${val})`,
      };
      return;
    }
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

/**
 * This middleware is a composition of other middleware required to use `window.fetch`
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API} with {@link createApi}
 */
export function fetcher<CurCtx extends FetchJsonCtx = FetchJsonCtx>(
  {
    baseUrl = '',
  }: {
    baseUrl?: string;
  } = { baseUrl: '' },
) {
  return compose<CurCtx>([
    headersMdw,
    apiUrlMdw(baseUrl),
    payloadMdw,
    fetchMdw,
    jsonMdw,
  ]);
}
