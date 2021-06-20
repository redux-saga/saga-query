import { call } from 'redux-saga/effects';

import { ApiCtx, CreateActionPayload, Next, RequestData } from './types';
import { queryCtx, urlParser, LoadingCtx, loadingTracker } from './middleware';
import { compose } from './pipe';

export interface FetchApiOpts extends RequestInit {
  url: string;
  data: RequestData;
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

export interface FetchCtx<D = any, E = any, P = any>
  extends ApiCtx,
    LoadingCtx {
  payload: P;
  request: Partial<FetchApiOpts>;
  response: ApiFetchResponse<D, E>;
}

export function fetchMiddleware<Ctx extends FetchCtx = FetchCtx>(
  err: (ctx: Ctx) => any,
) {
  return compose<Ctx>([queryCtx, urlParser, loadingTracker(err)]);
}
