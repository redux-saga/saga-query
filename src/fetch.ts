import { call } from 'redux-saga/effects';

import { QueryCtx, CreateActionPayload } from './types';
import { Next } from './create-api';
import { queryCtx, urlParser } from './middleware';

export interface FetchApiOpts extends RequestInit {
  url: string;
}

export interface ApiFetchSuccess<Data = any> {
  status: number;
  ok: true;
  data: Data;
}

export interface ApiFetchError<E = any> {
  status: number;
  ok: false;
  data: E;
}

export type ApiFetchResponse<Data = any, E = any> =
  | ApiFetchSuccess<Data>
  | ApiFetchError<E>;

export interface FetchCtx<D = any, E = any, P = any> extends QueryCtx {
  payload: P;
  request: Partial<FetchApiOpts>;
  response: ApiFetchResponse<D, E>;
}

/* export function fetchJsonify<
  Ctx extends FetchCtx = FetchCtx<any, any, { message: string }>,
>() {
  return function* onFetchJson(ctx: Ctx, next: Next): Generator<any, any, any> {
    const { url = '', ...options } = ctx.request;
    if (!options.headers) {
      options.headers = {} as HeadersInit;
    }
    if (options.headers && !(options.headers as any)['Content-Type']) {
      (options.headers as any)['Content-Type'] = 'application/json';
    }

    const resp = yield call(fetch, url, options);
    let data = {};
    try {
      data = yield call([resp, 'json']);
    } catch (err) {
      data = { message: err.message };
    }

    ctx.response = { status: resp.status, ok: resp.ok, data };

    yield next();
  };
} */
