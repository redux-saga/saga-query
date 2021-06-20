import { ApiCtx, RequestData } from './types';
import { LoadingCtx } from './middleware';

export interface FetchApiOpts extends RequestInit {
  url: string;
  data: RequestData;
  simpleCache: boolean;
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
