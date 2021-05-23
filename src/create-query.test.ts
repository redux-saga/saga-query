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
import { Next, createApi } from './create-api';
import {
  FetchCtx,
  urlParser,
  createFetchApi,
  createLoadingTracker,
} from './create-query';

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

test('query - basic', (t) => {
  const name = 'users';
  const cache = createTable<User>({ name });
  const query = createApi<FetchCtx>(name);
  const fetchApi = createFetchApi((opts) => {
    if (`${opts.url}`.startsWith('/users/')) {
      const json = mockUser2;
      return { status: 200, ok: true, data: json };
    }
    const json = {
      users: [mockUser],
    };
    return { status: 200, ok: true, data: json };
  });
  query.use(urlParser);
  query.use(fetchApi);

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

test('query - with loader', (t) => {
  const loaders = createLoaderTable({ name: 'loaders' });
  const name = 'users';
  const users = createTable<User>({ name });
  const query = createApi<FetchCtx>(name);
  const fetchApi = createFetchApi((opts) => ({
    status: 200,
    ok: true,
    data: {
      users: [mockUser],
    },
  }));
  query.use(urlParser);
  query.use(fetchApi);
  query.use(createLoadingTracker(loaders));

  const fetchUsers = query.create(
    `/users`,
    function* processUsers(ctx: FetchCtx<{ users: User[] }>, next) {
      yield next();
      if (!ctx.response.ok) return;
      const { data } = ctx.response;
      const curUsers = data.users.reduce<MapEntity<User>>((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});
      yield put(users.actions.add(curUsers));
    },
  );

  const reducers = createReducerMap(loaders, users);
  const store = setupStore(query.saga(), reducers);

  store.dispatch(fetchUsers());
  t.like(store.getState(), {
    [users.name]: { [mockUser.id]: mockUser },
    [loaders.name]: {
      '/users': {
        error: false,
        loading: false,
        success: true,
      },
    },
  });
});
