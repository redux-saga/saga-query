import test from 'ava';
import { takeLatest, put, delay } from 'redux-saga/effects';
import { createReducerMap, createTable, defaultLoadingItem } from 'robodux';
import type { MapEntity } from 'robodux';

import { createApi } from './api';
import {
  urlParser,
  queryCtx,
  requestParser,
  requestMonitor,
  undo,
} from './middleware';
import type { UndoCtx } from './middleware';
import type { FetchCtx } from './fetch';
import { setupStore } from './util';
import { DATA_NAME, LOADERS_NAME, createQueryState } from './slice';
import { undoer } from './';

interface User {
  id: string;
  name: string;
  email: string;
}

const mockUser: User = { id: '1', name: 'test', email: 'test@test.com' };
const mockUser2: User = { id: '2', name: 'two', email: 'two@test.com' };

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
    ...createQueryState(),
    users: { [mockUser.id]: mockUser },
  });
  store.dispatch(fetchUser({ id: '2' }));
  t.deepEqual(store.getState(), {
    ...createQueryState(),
    users: { [mockUser.id]: mockUser, [mockUser2.id]: mockUser2 },
  });
});

test('middleware - with loader', (t) => {
  const users = createTable<User>({ name: 'users' });

  const api = createApi<FetchCtx>();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(requestParser());
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

  const reducers = createReducerMap(users);
  const store = setupStore(api.saga(), reducers);

  store.dispatch(fetchUsers());
  t.like(store.getState(), {
    [users.name]: { [mockUser.id]: mockUser },
    [LOADERS_NAME]: {
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

test('quickSave', (t) => {
  const api = createApi<FetchCtx>();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(requestParser());
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

  const fetchUsers = api.get('/users', api.request({ simpleCache: true }));
  const store = setupStore(api.saga());

  const action = fetchUsers();
  store.dispatch(action);
  t.like(store.getState(), {
    [DATA_NAME]: {
      [JSON.stringify(action)]: { users: [mockUser] },
    },
    [LOADERS_NAME]: {
      [`${fetchUsers}`]: {
        status: 'success',
      },
    },
  });
});

test('overriding default loader behavior', (t) => {
  const users = createTable<User>({ name: 'users' });

  const api = createApi<FetchCtx>();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(requestParser());

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
      const id = ctx.name;
      yield next();
      if (!ctx.response.ok) {
        return;
      }
      const { data } = ctx.response;
      const curUsers = data.users.reduce<MapEntity<User>>((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});

      ctx.loader = { id, message: 'yes', meta: { wow: true } };
      ctx.actions.push(users.actions.add(curUsers));
    },
  );

  const reducers = createReducerMap(users);
  const store = setupStore(api.saga(), reducers);

  store.dispatch(fetchUsers());
  t.like(store.getState(), {
    [users.name]: { [mockUser.id]: mockUser },
    [LOADERS_NAME]: {
      [`${fetchUsers}`]: {
        status: 'success',
        message: 'yes',
        meta: { wow: true },
      },
    },
  });
});

test('undo', (t) => {
  const users = createTable<User>({ name: 'users' });

  const api = createApi<UndoCtx>();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(requestParser());
  api.use(undoer());

  api.use(function* fetchApi(ctx, next) {
    yield delay(500);
    ctx.response = {
      status: 200,
      ok: true,
      data: {
        users: [mockUser],
      },
    };
    yield next();
  });

  const createUser = api.post('/users', function* (ctx, next) {
    ctx.undoable = true;
    yield next();
  });

  const store = setupStore(api.saga());
  store.dispatch(createUser());
  store.dispatch(undo());
  t.deepEqual(store.getState(), {
    ...createQueryState({
      [LOADERS_NAME]: { [`${createUser}`]: defaultLoadingItem() },
    }),
  });
});

test('requestMonitor - error handler', (t) => {
  t.plan(1);
  const orgErr = console.error;
  let err = false;
  console.error = (msg: string) => {
    if (err) return;
    t.deepEqual(msg, 'Error: something happened.  Check the endpoint [/users]');
    err = true;
  };
  const name = 'users';
  const cache = createTable<User>({ name });
  const query = createApi<FetchCtx>();

  query.use(requestMonitor());
  query.use(query.routes());
  query.use(function* () {
    throw new Error('something happened');
  });

  const fetchUsers = query.create(`/users`);

  const reducers = createReducerMap(cache);
  const store = setupStore(query.saga(), reducers);
  store.dispatch(fetchUsers());
});
