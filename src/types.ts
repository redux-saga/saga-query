import { SagaIterator } from 'redux-saga';

export type Middleware<Ctx = any> = (ctx: Ctx, next: Next) => any;
export type Next = () => any;

export interface Action {
  type: string;
}

export interface ActionWithPayload<P> extends Action {
  payload: P;
}

export interface CreateActionPayload<P = any> {
  name: string;
  options: P;
}

export interface PipeCtx<P = any> {
  name: string;
  payload: P;
  action: ActionWithPayload<CreateActionPayload<P>>;
}

export interface CreateAction<Ctx> {
  (): ActionWithPayload<CreateActionPayload<{}>>;
  run: (p: ActionWithPayload<CreateActionPayload<{}>>) => SagaIterator<Ctx>;
}
export interface CreateActionWithPayload<Ctx, P> {
  (p: P): ActionWithPayload<CreateActionPayload<P>>;
  run: (a: ActionWithPayload<CreateActionPayload<P>>) => SagaIterator<Ctx>;
}

export interface RequestData {
  [key: string]: any;
}

export interface RequestCtx {
  url: string;
  method: string;
  body: any;
  data: RequestData;
  save: boolean;
}

export interface ApiCtx<P = any, R = any> extends PipeCtx<P> {
  request: Partial<RequestCtx>;
  response: R;
  actions: Action[];
}
