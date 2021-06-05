import { CallEffect } from 'redux-saga/effects';

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

export interface CreateAction {
  (): ActionWithPayload<CreateActionPayload<{}>>;
  run: () => CallEffect;
}
export interface CreateActionWithPayload<P> {
  (p: P): ActionWithPayload<CreateActionPayload<P>>;
  run: (p: P) => CallEffect;
}

export interface RequestCtx {
  url: string;
  method: string;
}

export interface QueryCtx<P = any, R = any> {
  name: string;
  payload: P;
  request: Partial<RequestCtx>;
  response: R;
}
