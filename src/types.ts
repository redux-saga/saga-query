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

export interface RequestCtx {
  url: string;
  method: string;
}

export interface QueryCtx<P = any, R = any> {
  payload: CreateActionPayload<P>;
  request: Partial<RequestCtx>;
  response: R;
}
