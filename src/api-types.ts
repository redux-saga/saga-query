/**
 * This is an auto-generated file, do not edit directly!
 * Run "yarn template" to generate this file.
 */
import type { SagaIterator } from 'redux-saga';
import type { SagaApi } from './pipe';
import type {
  ApiCtx,
  CreateAction,
  CreateActionWithPayload,
  MiddlewareCo,
  Next,
} from './types';

export type ApiName = string | string[];

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

    head(req: { saga?: any }): CreateAction<Ctx>;
    head<P>(req: { saga?: any }): CreateActionWithPayload<Ctx, P>;
    head(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    head<P>(fn: MiddlewareCo<Ctx>): CreateActionWithPayload<Ctx, P>;
    head(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    head<P>(
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
