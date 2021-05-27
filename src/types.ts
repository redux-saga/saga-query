export interface Action {
  type: string;
}

export interface ActionWithPayload<P> extends Action {
  payload: P;
}
