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
  FetchJson,
  MiddlewareApiCo,
  Payload,
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
    get<P, ApiSuccess = any, ApiError = any>(req: {
      saga?: any;
    }): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    get(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    get<P, ApiSuccess = any, ApiError = any>(
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    get(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    get<P, ApiSuccess = any, ApiError = any>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;

    post(req: { saga?: any }): CreateAction<Ctx>;
    post<P, ApiSuccess = any, ApiError = any>(req: {
      saga?: any;
    }): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    post(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    post<P, ApiSuccess = any, ApiError = any>(
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    post(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    post<P, ApiSuccess = any, ApiError = any>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;

    put(req: { saga?: any }): CreateAction<Ctx>;
    put<P, ApiSuccess = any, ApiError = any>(req: {
      saga?: any;
    }): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    put(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    put<P, ApiSuccess = any, ApiError = any>(
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    put(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    put<P, ApiSuccess = any, ApiError = any>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;

    patch(req: { saga?: any }): CreateAction<Ctx>;
    patch<P, ApiSuccess = any, ApiError = any>(req: {
      saga?: any;
    }): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    patch(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    patch<P, ApiSuccess = any, ApiError = any>(
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    patch(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    patch<P, ApiSuccess = any, ApiError = any>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;

    delete(req: { saga?: any }): CreateAction<Ctx>;
    delete<P, ApiSuccess = any, ApiError = any>(req: {
      saga?: any;
    }): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    delete(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    delete<P, ApiSuccess = any, ApiError = any>(
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    delete(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    delete<P, ApiSuccess = any, ApiError = any>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;

    options(req: { saga?: any }): CreateAction<Ctx>;
    options<P, ApiSuccess = any, ApiError = any>(req: {
      saga?: any;
    }): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    options(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    options<P, ApiSuccess = any, ApiError = any>(
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    options(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    options<P, ApiSuccess = any, ApiError = any>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;

    head(req: { saga?: any }): CreateAction<Ctx>;
    head<P, ApiSuccess = any, ApiError = any>(req: {
      saga?: any;
    }): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    head(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    head<P, ApiSuccess = any, ApiError = any>(
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    head(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    head<P, ApiSuccess = any, ApiError = any>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;

    connect(req: { saga?: any }): CreateAction<Ctx>;
    connect<P, ApiSuccess = any, ApiError = any>(req: {
      saga?: any;
    }): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    connect(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    connect<P, ApiSuccess = any, ApiError = any>(
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    connect(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    connect<P, ApiSuccess = any, ApiError = any>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;

    trace(req: { saga?: any }): CreateAction<Ctx>;
    trace<P, ApiSuccess = any, ApiError = any>(req: {
      saga?: any;
    }): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    trace(fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    trace<P, ApiSuccess = any, ApiError = any>(
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
    trace(req: { saga?: any }, fn: MiddlewareCo<Ctx>): CreateAction<Ctx>;
    trace<P, ApiSuccess = any, ApiError = any>(
      req: { saga?: any },
      fn: MiddlewareCo<Ctx>,
    ): CreateActionWithPayload<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>,
      P
    >;
  };

  /**
   * Only name
   */
  get(name: ApiName): CreateAction<Ctx>;
  get<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  get(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  get<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  get(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  get<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  get(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  get<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  post(name: ApiName): CreateAction<Ctx>;
  post<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  post(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  post<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  post(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  post<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  post(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  post<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  put(name: ApiName): CreateAction<Ctx>;
  put<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  put(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  put<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  put(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  put<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  put(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  put<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  patch(name: ApiName): CreateAction<Ctx>;
  patch<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  patch(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  patch<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  patch(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  patch<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  patch(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  patch<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  delete(name: ApiName): CreateAction<Ctx>;
  delete<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  delete(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  delete<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  delete(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  delete<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  delete(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  delete<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  options(name: ApiName): CreateAction<Ctx>;
  options<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  options(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  options<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  options(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  options<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  options(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  options<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  head(name: ApiName): CreateAction<Ctx>;
  head<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  head(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  head<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  head(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  head<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  head(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  head<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  connect(name: ApiName): CreateAction<Ctx>;
  connect<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  connect(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  connect<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  connect(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  connect<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  connect(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  connect<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  trace(name: ApiName): CreateAction<Ctx>;
  trace<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  trace(name: ApiName, req: { saga?: any }): CreateAction<Ctx>;
  trace<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  trace(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  trace<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  trace(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  trace<P, ApiSuccess = any, ApiError = any>(
    name: ApiName,
    req: { saga?: any },
    fn: MiddlewareApiCo<
      Omit<Ctx, 'payload' | 'json'> &
        Payload<P> &
        FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    Omit<Ctx, 'payload' | 'json'> &
      Payload<P> &
      FetchJson<ApiSuccess, ApiError>,
    P
  >;
}
