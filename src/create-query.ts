import { CreateAction, CreateActionWithPayload, QueryCtx } from './types';
import { SagaApi, Middleware, createApi, Next } from './create-api';

export interface SagaQueryApi<Ctx extends QueryCtx = QueryCtx>
  extends SagaApi<Ctx> {
  request: (
    r: Ctx['request'],
  ) => (ctx: Ctx, next: Next) => Generator<any, any, any>;
  get(name: string): CreateAction;
  get<P>(name: string): CreateActionWithPayload<P>;
  get(name: string, req: { saga?: any }): CreateAction;
  get<P>(name: string, req: { saga?: any }): CreateActionWithPayload<P>;
  get(name: string, fn: Middleware<Ctx>): CreateAction;
  get<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<P>;
  get(name: string, req: { saga?: any }, fn: Middleware<Ctx>): CreateAction;
  get<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<P>;

  post(name: string): CreateAction;
  post<P>(name: string): CreateActionWithPayload<P>;
  post(name: string, req: { saga?: any }): CreateAction;
  post<P>(name: string, req: { saga?: any }): CreateActionWithPayload<P>;
  post(name: string, fn: Middleware<Ctx>): CreateAction;
  post<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<P>;
  post(name: string, req: { saga?: any }, fn: Middleware<Ctx>): CreateAction;
  post<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<P>;

  put(name: string): CreateAction;
  put<P>(name: string): CreateActionWithPayload<P>;
  put(name: string, req: { saga?: any }): CreateAction;
  put<P>(name: string, req: { saga?: any }): CreateActionWithPayload<P>;
  put(name: string, fn: Middleware<Ctx>): CreateAction;
  put<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<P>;
  put(name: string, req: { saga?: any }, fn: Middleware<Ctx>): CreateAction;
  put<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<P>;

  patch(name: string): CreateAction;
  patch<P>(name: string): CreateActionWithPayload<P>;
  patch(name: string, req: { saga?: any }): CreateAction;
  patch<P>(name: string, req: { saga?: any }): CreateActionWithPayload<P>;
  patch(name: string, fn: Middleware<Ctx>): CreateAction;
  patch<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<P>;
  patch(name: string, req: { saga?: any }, fn: Middleware<Ctx>): CreateAction;
  patch<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<P>;

  delete(name: string): CreateAction;
  delete<P>(name: string): CreateActionWithPayload<P>;
  delete(name: string, req: { saga?: any }): CreateAction;
  delete<P>(name: string, req: { saga?: any }): CreateActionWithPayload<P>;
  delete(name: string, fn: Middleware<Ctx>): CreateAction;
  delete<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<P>;
  delete(name: string, req: { saga?: any }, fn: Middleware<Ctx>): CreateAction;
  delete<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<P>;

  options(name: string): CreateAction;
  options<P>(name: string): CreateActionWithPayload<P>;
  options(name: string, req: { saga?: any }): CreateAction;
  options<P>(name: string, req: { saga?: any }): CreateActionWithPayload<P>;
  options(name: string, fn: Middleware<Ctx>): CreateAction;
  options<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<P>;
  options(name: string, req: { saga?: any }, fn: Middleware<Ctx>): CreateAction;
  options<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<P>;

  head(name: string): CreateAction;
  head<P>(name: string): CreateActionWithPayload<P>;
  head(name: string, req: { saga?: any }): CreateAction;
  head<P>(name: string, req: { saga?: any }): CreateActionWithPayload<P>;
  head(name: string, fn: Middleware<Ctx>): CreateAction;
  head<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<P>;
  head(name: string, req: { saga?: any }, fn: Middleware<Ctx>): CreateAction;
  head<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<P>;

  connect(name: string): CreateAction;
  connect<P>(name: string): CreateActionWithPayload<P>;
  connect(name: string, req: { saga?: any }): CreateAction;
  connect<P>(name: string, req: { saga?: any }): CreateActionWithPayload<P>;
  connect(name: string, fn: Middleware<Ctx>): CreateAction;
  connect<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<P>;
  connect(name: string, req: { saga?: any }, fn: Middleware<Ctx>): CreateAction;
  connect<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<P>;

  trace(name: string): CreateAction;
  trace<P>(name: string): CreateActionWithPayload<P>;
  trace(name: string, req: { saga?: any }): CreateAction;
  trace<P>(name: string, req: { saga?: any }): CreateActionWithPayload<P>;
  trace(name: string, fn: Middleware<Ctx>): CreateAction;
  trace<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<P>;
  trace(name: string, req: { saga?: any }, fn: Middleware<Ctx>): CreateAction;
  trace<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<P>;
}

export function createQuery<Ctx extends QueryCtx = QueryCtx>(
  baseApi?: SagaApi<Ctx>,
): SagaQueryApi<Ctx> {
  const api = baseApi || createApi<Ctx>();
  return {
    use: api.use,
    saga: api.saga,
    create: api.create,
    request: (req: Ctx['request']) => {
      return function* onRequest(ctx: Ctx, next: Next) {
        ctx.request = req;
        yield next();
      };
    },
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
