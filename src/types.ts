import { SagaIterator } from 'redux-saga';

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

export interface ApiCtx<P = any> {
  name: string;
  payload: P;
  action: CreateActionPayload<P>;
}

export interface CreateAction<Ctx> {
  (): ActionWithPayload<CreateActionPayload<{}>>;
  run: (p: ActionWithPayload<CreateActionPayload<{}>>) => SagaIterator<Ctx>;
}
export interface CreateActionWithPayload<Ctx, P> {
  (p: P): ActionWithPayload<CreateActionPayload<P>>;
  run: (a: ActionWithPayload<CreateActionPayload<P>>) => SagaIterator<Ctx>;
}

export interface RequestCtx {
  url: string;
  method: string;
}

export interface QueryCtx<P = any, R = any> extends ApiCtx<P> {
  request: Partial<RequestCtx>;
  response: R;
  actions: Action[];
}
