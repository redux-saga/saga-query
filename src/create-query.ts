import { call, put, select } from 'redux-saga/effects';
import { Action, createTable, MapEntity, ActionWithPayload } from 'robodux';

import { Next, CreateActionPayload } from './create-api';
import { LoadingMapPayload } from 'robodux/dist';

interface FetchApiOpts extends RequestInit {
  url?: RequestInfo;
}

interface FetchOptions {
  auth?: boolean;
}

type ApiOpts = RequestInit & FetchOptions;

export interface ApiFetchSuccess<Data = any> {
  status: number;
  ok: true;
  data: Data;
}

interface ApiFetchError<E = { status: string; message: string }> {
  status: number;
  ok: false;
  data: E;
}

export type ApiFetchResponse<Data = any, E = any> =
  | ApiFetchSuccess<Data>
  | ApiFetchError<E>;

export interface FetchCtx<D = any, E = any, P = any> {
  payload: CreateActionPayload<P>;
  request: FetchApiOpts;
  response: ApiFetchResponse<D, E>;
}

export function* urlParser(ctx: FetchCtx, next: Next) {
  const { options = {} } = ctx.payload;
  if (!ctx.request) ctx.request = { url: '' };
  if (!ctx.request.url) {
    const url = Object.keys(options).reduce((acc, key) => {
      return acc.replace(`:${key}`, options[key]);
    }, ctx.payload.name);
    ctx.request.url = url;
  }
  yield next();
}

export function createFetchApi(
  onFetchApi: (opts: FetchApiOpts) => ApiFetchResponse,
) {
  return function* fetchApi(
    ctx: FetchCtx,
    next: Next,
  ): Generator<any, any, any> {
    const response = yield call(onFetchApi, ctx.request);
    ctx.response = response;
    yield next();
  };
}

export function createLoadingTracker(
  loaders: {
    actions: {
      loading: (l: LoadingMapPayload<string>) => any;
      error: (l: LoadingMapPayload<string>) => any;
      success: (l: LoadingMapPayload<string>) => any;
    };
  },
  successFn: (ctx: FetchCtx) => boolean = (ctx) => ctx.response.ok,
  errorFn: (ctx: FetchCtx) => string = (ctx) => ctx.response.data.message,
) {
  return function* trackLoading(ctx: FetchCtx, next: Next) {
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

export function createApiFetch<S = any>(
  selectUrl: (s?: S) => string,
  selectToken: (s?: S) => string,
) {
  return function* apiFetch<Data = any>(
    uri: string,
    opts: ApiOpts = {},
  ): Generator<any, ApiFetchResponse<Data>, any> {
    const apiUrl = yield select(selectUrl);
    const auth = typeof opts.auth === 'undefined' ? true : opts.auth;
    const options = { ...opts };
    delete options.auth;

    const url = `${apiUrl}/api${uri}`;
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (auth) {
      const token = yield select(selectToken);
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    options.headers = headers;

    const res: Response = yield call(fetch, url, options);

    if (res.status === 204) {
      return {
        status: res.status,
        ok: res.ok,
        data: {},
      } as ApiFetchSuccess<Data>;
    }
    const data = yield call([res, 'json']);

    return { status: res.status, ok: res.ok, data };
  };
}
