import type { SagaIterator } from 'redux-saga';
import type {
  CreateAction,
  CreateActionWithPayload,
  ApiCtx,
  MiddlewareCo,
  Next,
  ApiRequest,
} from './types';
import { createPipe } from './pipe';
import type { SagaApi } from './pipe';

export interface SagaQueryApi<Ctx extends ApiCtx = ApiCtx>
  extends SagaApi<Ctx> {
  request: (
    r: Partial<RequestInit>,
  ) => (ctx: Ctx, next: Next) => SagaIterator<any>;
  cache: () => (ctx: Ctx, next: Next) => SagaIterator<any>;

  uri: (uri: string) => {
    get(req: { saga?: any }): CreateAction<Ctx>;
    get<P>(req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
    get(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    get<P>(fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
    get(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    get<P>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<Ctx, P>;

    post(req: { saga?: any }): CreateAction<Ctx>;
    post<P>(req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
    post(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    post<P>(fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
    post(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    post<P>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<Ctx, P>;

    put(req: { saga?: any }): CreateAction<Ctx>;
    put<P>(req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
    put(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    put<P>(fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
    put(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    put<P>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<Ctx, P>;

    patch(req: { saga?: any }): CreateAction<Ctx>;
    patch<P>(req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
    patch(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    patch<P>(fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
    patch(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    patch<P>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<Ctx, P>;

    delete(req: { saga?: any }): CreateAction<Ctx>;
    delete<P>(req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
    delete(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    delete<P>(fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
    delete(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    delete<P>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<Ctx, P>;

    options(req: { saga?: any }): CreateAction<Ctx>;
    options<P>(req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
    options(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    options<P>(fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
    options(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    options<P>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<Ctx, P>;

    trace(req: { saga?: any }): CreateAction<Ctx>;
    trace<P>(req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
    trace(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    trace<P>(fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
    trace(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    trace<P>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<Ctx, P>;

    connect(req: { saga?: any }): CreateAction<Ctx>;
    connect<P>(req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
    connect(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    connect<P>(fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
    connect(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    connect<P>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<Ctx, P>;

    trace(req: { saga?: any }): CreateAction<Ctx>;
    trace<P>(req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
    trace(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    trace<P>(fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
    trace(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    trace<P>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<Ctx, P>;
  };

  get(name: string): CreateAction<Ctx>;
  get<P>(name: string): CreateActionWithPayload<Ctx, P>;
  get(name: string, req: { saga?: any }): CreateAction<Ctx>;
  get<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  get(name: string, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  get<P>(name: string, fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
  get(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  get<P>(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  post(name: string): CreateAction<Ctx>;
  post<P>(name: string): CreateActionWithPayload<Ctx, P>;
  post(name: string, req: { saga?: any }): CreateAction<Ctx>;
  post<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  post(name: string, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  post<P>(name: string, fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
  post(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  post<P>(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  put(name: string): CreateAction<Ctx>;
  put<P>(name: string): CreateActionWithPayload<Ctx, P>;
  put(name: string, req: { saga?: any }): CreateAction<Ctx>;
  put<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  put(name: string, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  put<P>(name: string, fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
  put(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  put<P>(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  patch(name: string): CreateAction<Ctx>;
  patch<P>(name: string): CreateActionWithPayload<Ctx, P>;
  patch(name: string, req: { saga?: any }): CreateAction<Ctx>;
  patch<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  patch(name: string, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  patch<P>(
    name: string,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  patch(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  patch<P>(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  delete(name: string): CreateAction<Ctx>;
  delete<P>(name: string): CreateActionWithPayload<Ctx, P>;
  delete(name: string, req: { saga?: any }): CreateAction<Ctx>;
  delete<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  delete(name: string, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  delete<P>(
    name: string,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  delete(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  delete<P>(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  options(name: string): CreateAction<Ctx>;
  options<P>(name: string): CreateActionWithPayload<Ctx, P>;
  options(name: string, req: { saga?: any }): CreateAction<Ctx>;
  options<P>(
    name: string,
    req: { saga?: any },
  ): CreateActionWithPayload<Ctx, P>;
  options(name: string, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  options<P>(
    name: string,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  options(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  options<P>(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  head(name: string): CreateAction<Ctx>;
  head<P>(name: string): CreateActionWithPayload<Ctx, P>;
  head(name: string, req: { saga?: any }): CreateAction<Ctx>;
  head<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  head(name: string, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  head<P>(name: string, fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
  head(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  head<P>(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  connect(name: string): CreateAction<Ctx>;
  connect<P>(name: string): CreateActionWithPayload<Ctx, P>;
  connect(name: string, req: { saga?: any }): CreateAction<Ctx>;
  connect<P>(
    name: string,
    req: { saga?: any },
  ): CreateActionWithPayload<Ctx, P>;
  connect(name: string, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  connect<P>(
    name: string,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  connect(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  connect<P>(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  trace(name: string): CreateAction<Ctx>;
  trace<P>(name: string): CreateActionWithPayload<Ctx, P>;
  trace(name: string, req: { saga?: any }): CreateAction<Ctx>;
  trace<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  trace(name: string, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  trace<P>(
    name: string,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  trace(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  trace<P>(
    name: string,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
}

export function createApi<Ctx extends ApiCtx = ApiCtx>(
  basePipe?: SagaApi<Ctx>,
): SagaQueryApi<Ctx> {
  const pipe = basePipe || createPipe<Ctx>();
  const uri = (name: string) => {
    const create = pipe.create as any;
    return {
      get: (...args: any[]) => create(`${name} [GET]`, ...args),
      post: (...args: any[]) => create(`${name} [POST]`, ...args),
      put: (...args: any[]) => create(`${name} [PUT]`, ...args),
      patch: (...args: any[]) => create(`${name} [PATCH]`, ...args),
      delete: (...args: any[]) => create(`${name} [DELETE]`, ...args),
      options: (...args: any[]) => create(`${name} [OPTIONS]`, ...args),
      head: (...args: any[]) => create(`${name} [HEAD]`, ...args),
      connect: (...args: any[]) => create(`${name} [CONNECT]`, ...args),
      trace: (...args: any[]) => create(`${name} [TRACE]`, ...args),
    };
  };

  return {
    use: pipe.use,
    saga: pipe.saga,
    create: pipe.create,
    routes: pipe.routes,
    cache: () => {
      return function* onCache(ctx: Ctx, next: Next) {
        ctx.cache = true;
        yield next();
      };
    },
    request: (req: ApiRequest) => {
      return function* onRequest(ctx: Ctx, next: Next) {
        ctx.request = ctx.req(req);
        yield next();
      };
    },
    uri,
    get: (name: string, ...args: any[]) => uri(name).get(...args),
    post: (name: string, ...args: any[]) => uri(name).post(...args),
    put: (name: string, ...args: any[]) => uri(name).put(...args),
    patch: (name: string, ...args: any[]) => uri(name).patch(...args),
    delete: (name: string, ...args: any[]) => uri(name).delete(...args),
    options: (name: string, ...args: any[]) => uri(name).options(...args),
    head: (name: string, ...args: any[]) => uri(name).head(...args),
    connect: (name: string, ...args: any[]) => uri(name).connect(...args),
    trace: (name: string, ...args: any[]) => uri(name).trace(...args),
  };
}
