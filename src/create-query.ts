import { Action, ActionWithPayload } from './types';
import { FetchCtx } from './middleware';
import { SagaApi, Middleware, createApi } from './create-api';

export interface SagaQueryApi<Ctx extends FetchCtx = FetchCtx>
  extends SagaApi<Ctx> {
  get(name: string): () => Action;
  get<P>(name: string): (p: P) => ActionWithPayload<P>;
  get(name: string, req: { saga?: any }): () => Action;
  get<P>(name: string, req: { saga?: any }): (p: P) => ActionWithPayload<P>;
  get(name: string, fn: Middleware<Ctx>): () => Action;
  get<P>(name: string, fn: Middleware<Ctx>): (p: P) => ActionWithPayload<P>;
  get(name: string, req: { saga?: any }, fn: Middleware<Ctx>): () => Action;
  get<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): (p: P) => ActionWithPayload<P>;

  post(name: string): () => Action;
  post<P>(name: string): (p: P) => ActionWithPayload<P>;
  post(name: string, req: { saga?: any }): () => Action;
  post<P>(name: string, req: { saga?: any }): (p: P) => ActionWithPayload<P>;
  post(name: string, fn: Middleware<Ctx>): () => Action;
  post<P>(name: string, fn: Middleware<Ctx>): (p: P) => ActionWithPayload<P>;
  post(name: string, req: { saga?: any }, fn: Middleware<Ctx>): () => Action;
  post<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): (p: P) => ActionWithPayload<P>;

  put(name: string): () => Action;
  put<P>(name: string): (p: P) => ActionWithPayload<P>;
  put(name: string, req: { saga?: any }): () => Action;
  put<P>(name: string, req: { saga?: any }): (p: P) => ActionWithPayload<P>;
  put(name: string, fn: Middleware<Ctx>): () => Action;
  put<P>(name: string, fn: Middleware<Ctx>): (p: P) => ActionWithPayload<P>;
  put(name: string, req: { saga?: any }, fn: Middleware<Ctx>): () => Action;
  put<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): (p: P) => ActionWithPayload<P>;

  patch(name: string): () => Action;
  patch<P>(name: string): (p: P) => ActionWithPayload<P>;
  patch(name: string, req: { saga?: any }): () => Action;
  patch<P>(name: string, req: { saga?: any }): (p: P) => ActionWithPayload<P>;
  patch(name: string, fn: Middleware<Ctx>): () => Action;
  patch<P>(name: string, fn: Middleware<Ctx>): (p: P) => ActionWithPayload<P>;
  patch(name: string, req: { saga?: any }, fn: Middleware<Ctx>): () => Action;
  patch<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): (p: P) => ActionWithPayload<P>;

  delete(name: string): () => Action;
  delete<P>(name: string): (p: P) => ActionWithPayload<P>;
  delete(name: string, req: { saga?: any }): () => Action;
  delete<P>(name: string, req: { saga?: any }): (p: P) => ActionWithPayload<P>;
  delete(name: string, fn: Middleware<Ctx>): () => Action;
  delete<P>(name: string, fn: Middleware<Ctx>): (p: P) => ActionWithPayload<P>;
  delete(name: string, req: { saga?: any }, fn: Middleware<Ctx>): () => Action;
  delete<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): (p: P) => ActionWithPayload<P>;

  options(name: string): () => Action;
  options<P>(name: string): (p: P) => ActionWithPayload<P>;
  options(name: string, req: { saga?: any }): () => Action;
  options<P>(name: string, req: { saga?: any }): (p: P) => ActionWithPayload<P>;
  options(name: string, fn: Middleware<Ctx>): () => Action;
  options<P>(name: string, fn: Middleware<Ctx>): (p: P) => ActionWithPayload<P>;
  options(name: string, req: { saga?: any }, fn: Middleware<Ctx>): () => Action;
  options<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): (p: P) => ActionWithPayload<P>;

  head(name: string): () => Action;
  head<P>(name: string): (p: P) => ActionWithPayload<P>;
  head(name: string, req: { saga?: any }): () => Action;
  head<P>(name: string, req: { saga?: any }): (p: P) => ActionWithPayload<P>;
  head(name: string, fn: Middleware<Ctx>): () => Action;
  head<P>(name: string, fn: Middleware<Ctx>): (p: P) => ActionWithPayload<P>;
  head(name: string, req: { saga?: any }, fn: Middleware<Ctx>): () => Action;
  head<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): (p: P) => ActionWithPayload<P>;

  connect(name: string): () => Action;
  connect<P>(name: string): (p: P) => ActionWithPayload<P>;
  connect(name: string, req: { saga?: any }): () => Action;
  connect<P>(name: string, req: { saga?: any }): (p: P) => ActionWithPayload<P>;
  connect(name: string, fn: Middleware<Ctx>): () => Action;
  connect<P>(name: string, fn: Middleware<Ctx>): (p: P) => ActionWithPayload<P>;
  connect(name: string, req: { saga?: any }, fn: Middleware<Ctx>): () => Action;
  connect<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): (p: P) => ActionWithPayload<P>;

  trace(name: string): () => Action;
  trace<P>(name: string): (p: P) => ActionWithPayload<P>;
  trace(name: string, req: { saga?: any }): () => Action;
  trace<P>(name: string, req: { saga?: any }): (p: P) => ActionWithPayload<P>;
  trace(name: string, fn: Middleware<Ctx>): () => Action;
  trace<P>(name: string, fn: Middleware<Ctx>): (p: P) => ActionWithPayload<P>;
  trace(name: string, req: { saga?: any }, fn: Middleware<Ctx>): () => Action;
  trace<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): (p: P) => ActionWithPayload<P>;
}

export function createQuery<Ctx extends FetchCtx = FetchCtx>(
  baseApi?: SagaApi<Ctx>,
): SagaQueryApi<Ctx> {
  const api = baseApi || createApi<Ctx>();
  return {
    use: api.use,
    saga: api.saga,
    create: api.create,
    get: (name: string, ...args: any[]) =>
      (api.create as any)(`${name} [GET]`, ...args),
    post: (name: string, ...args: any[]) =>
      (api.create as any)(`${name} [POST]`, ...args),
    put: (name: string, ...args: any[]) =>
      (api.create as any)(`${name} [PUT]`, ...args),
    patch: (name: string, ...args: any[]) =>
      (api.create as any)(`${name} [PATCH]`, ...args),
    delete: (name: string, ...args: any[]) =>
      (api.create as any)(`${name} [PATCH]`, ...args),
    options: (name: string, ...args: any[]) =>
      (api.create as any)(`${name} [OPTIONS]`, ...args),
    head: (name: string, ...args: any[]) =>
      (api.create as any)(`${name} [HEAD]`, ...args),
    connect: (name: string, ...args: any[]) =>
      (api.create as any)(`${name} [CONNECT]`, ...args),
    trace: (name: string, ...args: any[]) =>
      (api.create as any)(`${name} [TRACE]`, ...args),
  };
}
