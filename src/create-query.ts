import { call, put } from 'redux-saga/effects';
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

interface ApiFetchError {
  status: number;
  ok: false;
  data: {
    status: string;
    message: string;
  };
}

export type ApiFetchResponse<Data = any> =
  | ApiFetchSuccess<Data>
  | ApiFetchError;

export interface FetchCtx<D = any, P = any> {
  payload: CreateActionPayload<P>;
  request: FetchApiOpts;
  response: ApiFetchResponse<D>;
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
