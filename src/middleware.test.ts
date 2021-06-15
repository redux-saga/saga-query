import test from 'ava';
import createSagaMiddleware from 'redux-saga';
import { takeLatest, put } from 'redux-saga/effects';
import {
  createReducerMap,
  MapEntity,
  createTable,
  createLoaderTable,
} from 'robodux';
import { createStore, combineReducers, applyMiddleware } from 'redux';

import { Next } from './types';
import { createApi } from './api';
import { urlParser, loadingTracker, queryCtx } from './middleware';
import { FetchCtx } from './fetch';

interface User {
  id: string;
  name: string;
  email: string;
}

const mockUser: User = { id: '1', name: 'test', email: 'test@test.com' };
const mockUser2: User = { id: '2', name: 'two', email: 'two@test.com' };

function setupStore(saga: any, reducers: any) {
  const sagaMiddleware = createSagaMiddleware();
  const reducer = combineReducers(reducers);
  const store: any = createStore(reducer, applyMiddleware(sagaMiddleware));
  sagaMiddleware.run(saga);
  return store;
}

function* latest(action: string, saga: any, ...args: any[]) {
  yield takeLatest(`${action}`, saga, ...args);
}

test('middleware - basic', (t) => {
  const name = 'users';
  const cache = createTable<User>({ name });
  const query = createApi<FetchCtx>();

  query.use(query.routes());
  query.use(queryCtx);
  query.use(urlParser);
  query.use(function* fetchApi(ctx, next) {
    if (`${ctx.request.url}`.startsWith('/users/')) {
      const data = mockUser2;
      ctx.response = { status: 200, ok: true, data };
      yield next();
      return;
    }
    const data = {
      users: [mockUser],
    };
    ctx.response = { status: 200, ok: true, data };
    yield next();
  });

  const fetchUsers = query.create(
    `/users`,
    function* processUsers(ctx: FetchCtx<{ users: User[] }>, next) {
      yield next();
      if (!ctx.response.ok) return;
      const { users } = ctx.response.data;
      const curUsers = users.reduce<MapEntity<User>>((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});
      yield put(cache.actions.add(curUsers));
    },
  );

  const fetchUser = query.create<{ id: string }>(
    `/users/:id`,
    {
      saga: latest,
    },
    function* processUser(ctx: FetchCtx<User>, next) {
      ctx.request = {
        method: 'POST',
      };
      yield next();
      if (!ctx.response.ok) return;
      const curUser = ctx.response.data;
      const curUsers = { [curUser.id]: curUser };
      yield put(cache.actions.add(curUsers));
    },
  );

  const reducers = createReducerMap(cache);
  const store = setupStore(query.saga(), reducers);
  store.dispatch(fetchUsers());
  t.deepEqual(store.getState(), {
    users: { [mockUser.id]: mockUser },
  });
  store.dispatch(fetchUser({ id: '2' }));
  t.deepEqual(store.getState(), {
    users: { [mockUser.id]: mockUser, [mockUser2.id]: mockUser2 },
  });
});

test('middleware - with loader', (t) => {
  const users = createTable<User>({ name: 'users' });
  const loaders = createLoaderTable({ name: 'loaders' });

  const api = createApi<FetchCtx>();
  api.use(function* (ctx, next) {
    yield next();
    for (let i = 0; i < ctx.actions.length; i += 1) {
      const action = ctx.actions[i];
      yield put(action);
    }
  });
  api.use(loadingTracker(loaders));
  api.use(api.routes());
  api.use(queryCtx);
  api.use(urlParser);
  api.use(function* fetchApi(ctx, next) {
    ctx.response = {
      status: 200,
      ok: true,
      data: {
        users: [mockUser],
      },
    };
    yield next();
  });

  const fetchUsers = api.create(
    `/users`,
    function* processUsers(ctx: FetchCtx<{ users: User[] }>, next) {
      yield next();
      if (!ctx.response.ok) return;
      const { data } = ctx.response;
      const curUsers = data.users.reduce<MapEntity<User>>((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});

      ctx.actions.push(users.actions.add(curUsers));
    },
  );

  const reducers = createReducerMap(loaders, users);
  const store = setupStore(api.saga(), reducers);

  store.dispatch(fetchUsers());
  t.like(store.getState(), {
    [users.name]: { [mockUser.id]: mockUser },
    [loaders.name]: {
      '/users': {
        status: 'success',
      },
    },
  });
});

test('middleware - with POST', (t) => {
  t.plan(1);
  const name = 'users';
  const cache = createTable<User>({ name });
  const query = createApi<FetchCtx>();

  query.use(query.routes());
  query.use(queryCtx);
  query.use(urlParser);
  query.use(function* fetchApi(ctx, next) {
    t.deepEqual(ctx.request, {
      url: '/users',
      method: 'POST',
      body: JSON.stringify({ email: mockUser.email }),
    });
    const data = {
      users: [mockUser],
    };
    ctx.response = { status: 200, ok: true, data };
    yield next();
  });

  const createUser = query.create<{ email: string }>(
    `/users [POST]`,
    function* processUsers(ctx: FetchCtx<{ users: User[] }>, next) {
      ctx.request = {
        method: 'POST',
        body: JSON.stringify({ email: ctx.payload.email }),
      };
      yield next();
      if (!ctx.response.ok) return;
      const { users } = ctx.response.data;
      const curUsers = users.reduce<MapEntity<User>>((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});
      yield put(cache.actions.add(curUsers));
    },
  );

  const reducers = createReducerMap(cache);
  const store = setupStore(query.saga(), reducers);
  store.dispatch(createUser({ email: mockUser.email }));
});
