import { SagaIterator } from 'redux-saga';
import {
  CreateAction,
  CreateActionWithPayload,
  ApiCtx,
  Middleware,
  Next,
} from './types';
import { SagaApi, createPipe } from './pipe';

export interface SagaQueryApi<Ctx extends ApiCtx = ApiCtx>
  extends SagaApi<Ctx> {
  request: (r: Ctx['request']) => (ctx: Ctx, next: Next) => SagaIterator<any>;

  get(name: string): CreateAction<Ctx>;
  get<P>(name: string): CreateActionWithPayload<Ctx, P>;
  get(name: string, req: { saga?: any }): CreateAction<Ctx>;
  get<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  get(name: string, fn: Middleware<Ctx>): CreateAction<Ctx>;
  get<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<Ctx, P>;
  get(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateAction<Ctx>;
  get<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  post(name: string): CreateAction<Ctx>;
  post<P>(name: string): CreateActionWithPayload<Ctx, P>;
  post(name: string, req: { saga?: any }): CreateAction<Ctx>;
  post<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  post(name: string, fn: Middleware<Ctx>): CreateAction<Ctx>;
  post<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<Ctx, P>;
  post(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateAction<Ctx>;
  post<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  put(name: string): CreateAction<Ctx>;
  put<P>(name: string): CreateActionWithPayload<Ctx, P>;
  put(name: string, req: { saga?: any }): CreateAction<Ctx>;
  put<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  put(name: string, fn: Middleware<Ctx>): CreateAction<Ctx>;
  put<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<Ctx, P>;
  put(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateAction<Ctx>;
  put<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  patch(name: string): CreateAction<Ctx>;
  patch<P>(name: string): CreateActionWithPayload<Ctx, P>;
  patch(name: string, req: { saga?: any }): CreateAction<Ctx>;
  patch<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  patch(name: string, fn: Middleware<Ctx>): CreateAction<Ctx>;
  patch<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<Ctx, P>;
  patch(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateAction<Ctx>;
  patch<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  delete(name: string): CreateAction<Ctx>;
  delete<P>(name: string): CreateActionWithPayload<Ctx, P>;
  delete(name: string, req: { saga?: any }): CreateAction<Ctx>;
  delete<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  delete(name: string, fn: Middleware<Ctx>): CreateAction<Ctx>;
  delete<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<Ctx, P>;
  delete(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateAction<Ctx>;
  delete<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  options(name: string): CreateAction<Ctx>;
  options<P>(name: string): CreateActionWithPayload<Ctx, P>;
  options(name: string, req: { saga?: any }): CreateAction<Ctx>;
  options<P>(
    name: string,
    req: { saga?: any },
  ): CreateActionWithPayload<Ctx, P>;
  options(name: string, fn: Middleware<Ctx>): CreateAction<Ctx>;
  options<P>(
    name: string,
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  options(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateAction<Ctx>;
  options<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  head(name: string): CreateAction<Ctx>;
  head<P>(name: string): CreateActionWithPayload<Ctx, P>;
  head(name: string, req: { saga?: any }): CreateAction<Ctx>;
  head<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  head(name: string, fn: Middleware<Ctx>): CreateAction<Ctx>;
  head<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<Ctx, P>;
  head(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateAction<Ctx>;
  head<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  connect(name: string): CreateAction<Ctx>;
  connect<P>(name: string): CreateActionWithPayload<Ctx, P>;
  connect(name: string, req: { saga?: any }): CreateAction<Ctx>;
  connect<P>(
    name: string,
    req: { saga?: any },
  ): CreateActionWithPayload<Ctx, P>;
  connect(name: string, fn: Middleware<Ctx>): CreateAction<Ctx>;
  connect<P>(
    name: string,
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  connect(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateAction<Ctx>;
  connect<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  trace(name: string): CreateAction<Ctx>;
  trace<P>(name: string): CreateActionWithPayload<Ctx, P>;
  trace(name: string, req: { saga?: any }): CreateAction<Ctx>;
  trace<P>(name: string, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  trace(name: string, fn: Middleware<Ctx>): CreateAction<Ctx>;
  trace<P>(name: string, fn: Middleware<Ctx>): CreateActionWithPayload<Ctx, P>;
  trace(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateAction<Ctx>;
  trace<P>(
    name: string,
    req: { saga?: any },
    fn: Middleware<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
}

export function createApi<Ctx extends ApiCtx = ApiCtx>(
  basePipe?: SagaApi<Ctx>,
): SagaQueryApi<Ctx> {
  const api = basePipe || createPipe<Ctx>();
  return {
    use: api.use,
    saga: api.saga,
    create: api.create,
    routes: api.routes,
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
