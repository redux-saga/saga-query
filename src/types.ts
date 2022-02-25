import type { SagaIterator } from 'redux-saga';
import type { LoadingMapPayload } from 'robodux';

export interface PipeCtx<P = any> {
  name: string;
  key: string;
  payload: P;
  action: ActionWithPayload<CreateActionPayload<P>>;
}

export interface ApiFetchSuccess<S = any> {
  ok: true;
  data: S;
}

export interface ApiFetchError<E = any> {
  ok: false;
  data: E;
}

export type ApiFetchResponse<S = any, E = any> =
  | ApiFetchSuccess<S>
  | ApiFetchError<E>;

export type ApiRequest = Partial<{ url: string } & RequestInit>;
export type RequiredApiRequest = {
  url: string;
  headers: HeadersInit;
} & Partial<RequestInit>;

export interface FetchCtx<P = any> extends PipeCtx<P> {
  request: ApiRequest | null;
  req: (r?: ApiRequest) => RequiredApiRequest;
  response: Response | null;
}

export interface FetchJsonCtx<P = any, S = any, E = any> extends FetchCtx<P> {
  json: ApiFetchResponse<S, E>;
}

export interface ApiCtx<P = any, S = any, E = any>
  extends FetchJsonCtx<P, S, E> {
  actions: Action[];
  loader: LoadingMapPayload<Record<string, any>> | null;
  cache: boolean;
}

export type Middleware<Ctx extends PipeCtx = PipeCtx> = (
  ctx: Ctx,
  next: Next,
) => any;
export type MiddlewareCo<Ctx extends PipeCtx = PipeCtx> =
  | Middleware<Ctx>
  | Middleware<Ctx>[];

export type Next = () => any;

export interface Action {
  type: string;
}

export interface ActionWithPayload<P> extends Action {
  payload: P;
}

export interface CreateActionPayload<P = any> {
  name: string;
  key: string;
  options: P;
}

export interface CreateAction<Ctx> {
  (): ActionWithPayload<CreateActionPayload<{}>>;
  run: (p: ActionWithPayload<CreateActionPayload<{}>>) => SagaIterator<Ctx>;
}

export interface CreateActionWithPayload<Ctx, P> {
  (p: P): ActionWithPayload<CreateActionPayload<P>>;
  run: (a: ActionWithPayload<CreateActionPayload<P>>) => SagaIterator<Ctx>;
}
