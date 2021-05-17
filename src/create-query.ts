import { call } from 'redux-saga/effects';
import { Action, createTable, MapEntity } from 'robodux';

import { createApi, Next, Middleware } from './create-api';

interface FetchApiOpts {
  url: RequestInfo;
  options?: RequestInit;
  middleware?: Middleware[];
}

export interface QueryCtx<R> {
  request: FetchApiOpts;
  response: R;
}

export function createQuery<E, R = any, Ctx extends QueryCtx<R> = any>(
  name: string,
  onFetchApi: (opts: FetchApiOpts) => Generator<any, any, any>,
) {
  const cache = createTable<E>({ name });
  const api = createApi<Ctx, FetchApiOpts>(name);
  api.use(function* fetchApi(ctx, next): Generator<any, any, any> {
    const response = yield call(onFetchApi, ctx.request);
    ctx.response = response;
    yield next();
  });
  return { ...api, ...cache };
}

/* const api = createApi<RoboCtx, FetchApiOpts>('users');
  api.use(onFetchApi);
  api.use(setupActionState);
  api.use(processUsers);
  api.use(processTickets);
  api.use(saveToRedux);
  const fetchUsers = () => api.create({ url: `/users` }); */
