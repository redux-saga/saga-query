import test from 'ava';
import { takeLatest, put, delay } from 'redux-saga/effects';
import { createReducerMap, createTable, defaultLoadingItem } from 'robodux';
import type { MapEntity } from 'robodux';
import { Buffer } from 'buffer';

import { createApi } from './api';
import {
  urlParser,
  queryCtx,
  requestMonitor,
  undo,
  undoer,
  customKey,
} from './middleware';
import type { UndoCtx } from './middleware';
import type { ApiCtx } from './types';
import { setupStore, sleep } from './util';
import { createKey } from './create-key';
import { DATA_NAME, LOADERS_NAME, createQueryState } from './slice';
import { SagaIterator } from 'redux-saga';

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

const jsonBlob = (data: any) => {
  return Buffer.from(JSON.stringify(data));
};

test('middleware - basic', (t) => {
  const name = 'users';
  const cache = createTable<User>({ name });
  const query = createApi<ApiCtx>();

  query.use(queryCtx);
  query.use(urlParser);
  query.use(query.routes());
  query.use(function* fetchApi(ctx, next) {
    if (`${ctx.req().url}`.startsWith('/users/')) {
      ctx.json = { ok: true, data: mockUser2 };
      yield next();
      return;
    }
    const data = {
      users: [mockUser],
    };
    ctx.json = { ok: true, data };
    yield next();
  });

  const fetchUsers = query.create(
    `/users`,
    function* processUsers(ctx: ApiCtx<any, { users: User[] }>, next) {
      yield next();
      if (!ctx.json.ok) return;
      const { users } = ctx.json.data;
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
    function* processUser(ctx: ApiCtx<User>, next) {
      ctx.request = ctx.req({ method: 'POST' });
      yield next();
      if (!ctx.json.ok) return;
      const curUser = ctx.json.data;
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

  const api = createApi<ApiCtx>();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(function* fetchApi(ctx, next) {
    ctx.response = new Response(jsonBlob(mockUser), { status: 200 });
    ctx.json = { ok: true, data: { users: [mockUser] } };
    yield next();
  });

  const fetchUsers = api.create(
    `/users`,
    function* processUsers(ctx: ApiCtx<any, { users: User[] }>, next) {
      yield next();
      if (!ctx.json.ok) return;

      const { data } = ctx.json;
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

test('middleware - with item loader', (t) => {
  const users = createTable<User>({ name: 'users' });

  const api = createApi<ApiCtx>();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(function* fetchApi(ctx, next) {
    ctx.response = new Response(jsonBlob(mockUser), { status: 200 });
    ctx.json = { ok: true, data: { users: [mockUser] } };
    yield next();
  });

  const fetchUser = api.create<{ id: string }>(
    `/users/:id`,
    function* processUsers(ctx: ApiCtx<any, { users: User[] }>, next) {
      yield next();
      if (!ctx.json.ok) return;

      const { data } = ctx.json;
      const curUsers = data.users.reduce<MapEntity<User>>((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});

      ctx.actions.push(users.actions.add(curUsers));
    },
  );

  const reducers = createReducerMap(users);
  const store = setupStore(api.saga(), reducers);

  const action = fetchUser({ id: mockUser.id });
  store.dispatch(action);
  t.like(store.getState(), {
    [users.name]: { [mockUser.id]: mockUser },
    [LOADERS_NAME]: {
      '/users/:id': {
        status: 'success',
      },
      [action.payload.key]: {
        status: 'success',
      },
    },
  });
});

test('middleware - with POST', async (t) => {
  t.plan(1);
  const name = 'users';
  const cache = createTable<User>({ name });
  const query = createApi();

  query.use(queryCtx);
  query.use(urlParser);
  query.use(query.routes());
  query.use(function* fetchApi(ctx, next): SagaIterator<any> {
    const request = ctx.req();
    t.deepEqual(request, {
      url: '/users',
      headers: {},
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com' }),
    });

    const data = {
      users: [mockUser],
    };
    ctx.response = new Response(jsonBlob(data), { status: 200 });
    yield next();
  });

  const createUser = query.create<{ email: string }>(
    `/users [POST]`,
    function* processUsers(
      ctx: ApiCtx<{ email: string }, { users: User[] }>,
      next,
    ) {
      ctx.request = ctx.req({
        method: 'POST',
        body: JSON.stringify({ email: ctx.payload.email }),
      });

      yield next();

      if (!ctx.json.ok) return;

      const { users } = ctx.json.data;
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

test('simpleCache', (t) => {
  const api = createApi<ApiCtx>();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(function* fetchApi(ctx, next) {
    const data = { users: [mockUser] };
    ctx.response = new Response(jsonBlob(data));
    ctx.json = { ok: true, data };
    yield next();
  });

  const fetchUsers = api.get('/users', api.cache());
  const store = setupStore(api.saga());

  const action = fetchUsers();
  store.dispatch(action);
  t.like(store.getState(), {
    [DATA_NAME]: {
      [action.payload.key]: { users: [mockUser] },
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

  const api = createApi<ApiCtx>();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(function* fetchApi(ctx, next) {
    const data = { users: [mockUser] };
    ctx.response = new Response(jsonBlob(data));
    ctx.json = { ok: true, data };
    yield next();
  });

  const fetchUsers = api.create(
    `/users`,
    function* (ctx: ApiCtx<any, { users: User[] }>, next) {
      const id = ctx.name;
      yield next();

      if (!ctx.json.ok) {
        return;
      }
      const { data } = ctx.json;
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
  const api = createApi<UndoCtx>();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(undoer());

  api.use(function* fetchApi(ctx, next) {
    yield delay(500);
    ctx.response = new Response(jsonBlob({ users: [mockUser] }), {
      status: 200,
    });
    yield next();
  });

  const createUser = api.post('/users', function* (ctx, next) {
    ctx.undoable = true;
    yield next();
  });

  const store = setupStore(api.saga());
  const action = createUser();
  store.dispatch(action);
  store.dispatch(undo());
  t.deepEqual(store.getState(), {
    ...createQueryState({
      [LOADERS_NAME]: {
        [`${createUser}`]: defaultLoadingItem(),
        [action.payload.key]: defaultLoadingItem(),
      },
    }),
  });
});

test('requestMonitor - error handler', (t) => {
  t.plan(1);
  let err = false;
  console.error = (msg: string) => {
    if (err) return;
    t.deepEqual(msg, 'Error: something happened.  Check the endpoint [/users]');
    err = true;
  };
  const name = 'users';
  const cache = createTable<User>({ name });
  const query = createApi<ApiCtx>();

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

test('createApi with own key', async (t) => {
  t.plan(2);
  const query = createApi();
  query.use(requestMonitor());
  query.use(query.routes());
  query.use(customKey);
  query.use(function* fetchApi(ctx, next): SagaIterator<any> {
    const data = {
      users: [{ ...mockUser, ...ctx.action.payload.options }],
    };
    ctx.response = new Response(jsonBlob(data), { status: 200 });
    yield next();
  });

  const theTestKey = `some-custom-key-${Math.ceil(Math.random() * 1000)}`;

  const createUserCustomKey = query.post<{ email: string }>(
    `/users`,
    function* processUsers(ctx: ApiCtx<any, any>, next) {
      ctx.cache = true;
      ctx.key = theTestKey; // or some calculated key //
      yield next();
      const buff: Buffer = yield ctx.response?.arrayBuffer();
      const result = new TextDecoder('utf-8').decode(buff);
      const { users } = JSON.parse(result);
      if (!users) return;
      const curUsers = (users as User[]).reduce<MapEntity<User>>((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});
      ctx.response = new Response();
      ctx.json = {
        ok: true,
        data: curUsers,
      };
    },
  );
  const newUEmail = mockUser.email + '.org';
  const reducers = createReducerMap();
  const store = setupStore(query.saga(), reducers);
  store.dispatch(createUserCustomKey({ email: newUEmail }));
  await sleep(50);
  const s = await store.getState();
  await sleep(50);
  const expectedKey = theTestKey
    ? `/users [POST]|${theTestKey}`
    : createKey('/users [POST]', { email: newUEmail });

  t.deepEqual(s['@@saga-query/data'][expectedKey], {
    '1': { id: '1', name: 'test', email: newUEmail },
  });

  t.assert(
    expectedKey.split('|')[1] === theTestKey,
    'the keypart should match the input',
  );
});

test('createApi with custom key but no payload', async (t) => {
  t.plan(2);
  const query = createApi();
  query.use(requestMonitor());
  query.use(query.routes());
  query.use(customKey);
  query.use(function* fetchApi(ctx, next): SagaIterator<any> {
    const data = {
      users: [mockUser],
    };
    ctx.response = new Response(jsonBlob(data), { status: 200 });
    yield next();
  });

  const theTestKey = `some-custom-key-${Math.ceil(Math.random() * 1000)}`;

  const getUsers = query.get(
    `/users`,
    function* processUsers(ctx: ApiCtx<any, any>, next) {
      ctx.cache = true;
      ctx.key = theTestKey; // or some calculated key //
      yield next();
      const buff: Buffer = yield ctx.response?.arrayBuffer();
      const result = new TextDecoder('utf-8').decode(buff);
      const { users } = JSON.parse(result);
      if (!users) return;
      const curUsers = (users as User[]).reduce<MapEntity<User>>((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});
      ctx.response = new Response();
      ctx.json = {
        ok: true,
        data: curUsers,
      };
    },
  );

  const reducers = createReducerMap();
  const store = setupStore(query.saga(), reducers);
  store.dispatch(getUsers());
  await sleep(50);
  const s = await store.getState();
  await sleep(50);
  const expectedKey = theTestKey
    ? `/users [GET]|${theTestKey}`
    : createKey('/users [GET]', null);

  t.deepEqual(s['@@saga-query/data'][expectedKey], {
    '1': mockUser,
  });

  t.assert(
    expectedKey.split('|')[1] === theTestKey,
    'the keypart should match the input',
  );
});
