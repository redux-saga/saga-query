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

type ApiName = string | string[];

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

  get(name: ApiName): CreateAction<Ctx>;
  get<P>(name: ApiName): CreateActionWithPayload<Ctx, P>;
  get(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  get<P>(name: ApiName, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  get(name: ApiName, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  get<P>(name: ApiName, fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
  get(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  get<P>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  post(name: ApiName): CreateAction<Ctx>;
  post<P>(name: ApiName): CreateActionWithPayload<Ctx, P>;
  post(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  post<P>(name: ApiName, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  post(name: ApiName, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  post<P>(
    name: ApiName,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  post(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  post<P>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  put(name: ApiName): CreateAction<Ctx>;
  put<P>(name: ApiName): CreateActionWithPayload<Ctx, P>;
  put(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  put<P>(name: ApiName, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  put(name: ApiName, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  put<P>(name: ApiName, fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
  put(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  put<P>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  patch(name: ApiName): CreateAction<Ctx>;
  patch<P>(name: ApiName): CreateActionWithPayload<Ctx, P>;
  patch(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  patch<P>(name: ApiName, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  patch(name: ApiName, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  patch<P>(
    name: ApiName,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  patch(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  patch<P>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  delete(name: ApiName): CreateAction<Ctx>;
  delete<P>(name: ApiName): CreateActionWithPayload<Ctx, P>;
  delete(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  delete<P>(
    name: ApiName,
    req: { saga?: any },
  ): CreateActionWithPayload<Ctx, P>;
  delete(name: ApiName, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  delete<P>(
    name: ApiName,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  delete(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  delete<P>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  options(name: ApiName): CreateAction<Ctx>;
  options<P>(name: ApiName): CreateActionWithPayload<Ctx, P>;
  options(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  options<P>(
    name: ApiName,
    req: { saga?: any },
  ): CreateActionWithPayload<Ctx, P>;
  options(name: ApiName, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  options<P>(
    name: ApiName,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  options(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  options<P>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  head(name: ApiName): CreateAction<Ctx>;
  head<P>(name: ApiName): CreateActionWithPayload<Ctx, P>;
  head(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  head<P>(name: ApiName, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  head(name: ApiName, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  head<P>(
    name: ApiName,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  head(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  head<P>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  connect(name: ApiName): CreateAction<Ctx>;
  connect<P>(name: ApiName): CreateActionWithPayload<Ctx, P>;
  connect(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  connect<P>(
    name: ApiName,
    req: { saga?: any },
  ): CreateActionWithPayload<Ctx, P>;
  connect(name: ApiName, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  connect<P>(
    name: ApiName,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  connect(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  connect<P>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;

  trace(name: ApiName): CreateAction<Ctx>;
  trace<P>(name: ApiName): CreateActionWithPayload<Ctx, P>;
  trace(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  trace<P>(name: ApiName, req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
  trace(name: ApiName, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
  trace<P>(
    name: ApiName,
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
  trace(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateAction<Ctx>;
  trace<P>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareCo<Ctx>,
  ): CreateActionWithPayload<Ctx, P>;
}

/**
 * Creates a middleware pipeline for HTTP requests.
 *
 * @remarks
 * It uses {@link createPipe} under the hood.
 *
 * @example
 * ```ts
 * import { createApi, requestMonitor, fetcher } from 'saga-query';
 *
 * const api = createApi();
 * api.use(requestMonitor());
 * api.use(api.routes());
 * api.use(fetcher({ baseUrl: 'https://api.com' }));
 *
 * const fetchUsers = api.get('/users', function*(ctx, next) {
 *   yield next();
 * });
 *
 * store.dispatch(fetchUsers());
 * ```
 */
export function createApi<Ctx extends ApiCtx = ApiCtx>(
  basePipe?: SagaApi<Ctx>,
): SagaQueryApi<Ctx> {
  const pipe = basePipe || createPipe<Ctx>();
  const uri = (prename: ApiName) => {
    const create = pipe.create as any;

    let name = prename;
    let remainder = '';
    if (Array.isArray(name)) {
      if (name.length === 0) {
        throw new Error(
          'createApi requires a non-empty array for the name of the endpoint',
        );
      }
      name = prename[0];
      if (name.length > 1) {
        const [_, ...other] = prename;
        remainder = ` ${other.join('|')}`;
      }
    }
    const tmpl = (method: string) => `${name} [${method}]${remainder}`;

    return {
      get: (...args: any[]) => create(tmpl('GET'), ...args),
      post: (...args: any[]) => create(tmpl('POST'), ...args),
      put: (...args: any[]) => create(tmpl('PUT'), ...args),
      patch: (...args: any[]) => create(tmpl('PATCH'), ...args),
      delete: (...args: any[]) => create(tmpl('DELETE'), ...args),
      options: (...args: any[]) => create(tmpl('OPTIONS'), ...args),
      head: (...args: any[]) => create(tmpl('HEAD'), ...args),
      connect: (...args: any[]) => create(tmpl('CONNECT'), ...args),
      trace: (...args: any[]) => create(tmpl('TRACE'), ...args),
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
    get: (name: ApiName, ...args: any[]) => uri(name).get(...args),
    post: (name: ApiName, ...args: any[]) => uri(name).post(...args),
    put: (name: ApiName, ...args: any[]) => uri(name).put(...args),
    patch: (name: ApiName, ...args: any[]) => uri(name).patch(...args),
    delete: (name: ApiName, ...args: any[]) => uri(name).delete(...args),
    options: (name: ApiName, ...args: any[]) => uri(name).options(...args),
    head: (name: ApiName, ...args: any[]) => uri(name).head(...args),
    connect: (name: ApiName, ...args: any[]) => uri(name).connect(...args),
    trace: (name: ApiName, ...args: any[]) => uri(name).trace(...args),
  };
}
