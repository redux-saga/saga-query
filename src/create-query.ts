import { call } from 'redux-saga/effects';
import { Action, createTable, MapEntity, ActionWithPayload } from 'robodux';

import { Next, CreateActionPayload } from './create-api';

interface FetchApiOpts extends RequestInit {
  url?: RequestInfo;
}

export interface QueryCtx<R = any, P = any> {
  payload: CreateActionPayload<P>;
  request: FetchApiOpts;
  response: R;
}

export function* urlParser(ctx: QueryCtx, next: Next) {
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

export function createFetchApi(onFetchApi: (opts: FetchApiOpts) => any) {
  return function* fetchApi(
    ctx: QueryCtx,
    next: Next,
  ): Generator<any, any, any> {
    const response = yield call(onFetchApi, ctx.request);
    ctx.response = response;
    yield next();
  };
}
