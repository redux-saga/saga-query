import test from 'ava';
import type { SagaIterator } from 'redux-saga';
import { takeEvery, put, call } from 'redux-saga/effects';
import { createAction, createReducerMap, createTable } from 'robodux';
import type { MapEntity } from 'robodux';
import { Buffer } from 'buffer';

import { urlParser, queryCtx, requestMonitor } from './middleware';
import { createApi } from './api';
import { setupStore } from './util';
import { ApiCtx } from '.';

interface User {
  id: string;
  name: string;
  email: string;
}

const mockUser: User = { id: '1', name: 'test', email: 'test@test.com' };

const jsonBlob = (data: any) => {
  return Buffer.from(JSON.stringify(data));
};

const sleep = (n: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, n);
  });
test('createApi - POST', async (t) => {
  t.plan(2);
  const name = 'users';
  const cache = createTable<User>({ name });
  const query = createApi();

  query.use(queryCtx);
  query.use(urlParser);
  query.use(query.routes());
  query.use(function* fetchApi(ctx, next): SagaIterator<any> {
    t.deepEqual(ctx.req(), {
      url: '/users',
      headers: {},
      method: 'POST',
      body: JSON.stringify({ email: mockUser.email }),
    });
    const data = {
      users: [mockUser],
    };

    ctx.response = new Response(jsonBlob(data), { status: 200 });

    yield next();
  });

  const createUser = query.post<{ email: string }>(
    `/users`,
    function* processUsers(ctx: ApiCtx<any, { users: User[] }>, next) {
      ctx.request = ctx.req({
        method: 'POST',
        body: JSON.stringify({ email: ctx.payload.email }),
      });
      yield next();

      const buff: Buffer = yield ctx.response?.arrayBuffer();
      const result = new TextDecoder('utf-8').decode(buff);
      const { users } = JSON.parse(result);
      if (!users) return;
      const curUsers = (users as User[]).reduce<MapEntity<User>>((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});
      yield put(cache.actions.add(curUsers));
    },
  );

  const reducers = createReducerMap(cache);
  const store = setupStore(query.saga(), reducers);
  store.dispatch(createUser({ email: mockUser.email }));
  await sleep(150);
  t.deepEqual(store.getState().users, {
    '1': { id: '1', name: 'test', email: 'test@test.com' },
  });
});
test('createApi - POST with uri', async (t) => {
  t.plan(1);
  const name = 'users';
  const cache = createTable<User>({ name });
  const query = createApi();

  query.use(queryCtx);
  query.use(urlParser);
  query.use(query.routes());
  query.use(function* fetchApi(ctx, next): SagaIterator<any> {
    t.deepEqual(ctx.req(), {
      url: '/users',
      headers: {},
      method: 'POST',
      body: JSON.stringify({ email: mockUser.email }),
    });

    const data = {
      users: [mockUser],
    };
    ctx.response = new Response(jsonBlob(data), { status: 200 });
    yield next();
  });

  const userApi = query.uri('/users');
  const createUser = userApi.post<{ email: string }>(function* processUsers(
    ctx: ApiCtx<{ email: string }, { users: User[] }>,
    next,
  ) {
    ctx.request = ctx.req({
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
  });

  const reducers = createReducerMap(cache);
  const store = setupStore(query.saga(), reducers);
  store.dispatch(createUser({ email: mockUser.email }));
});

test('middleware - with request fn', (t) => {
  t.plan(2);
  const query = createApi();
  query.use(queryCtx);
  query.use(urlParser);
  query.use(query.routes());
  query.use(function* (ctx, next) {
    t.deepEqual(ctx.req().method, 'POST');
    t.deepEqual(ctx.req().url, '/users');
  });
  const createUser = query.create('/users', query.request({ method: 'POST' }));
  const store = setupStore(query.saga());
  store.dispatch(createUser());
});

test('run() on endpoint action - should run the effect', (t) => {
  t.plan(1);
  const api = createApi();
  api.use(api.routes());
  let acc = '';
  const action1 = api.get<{ id: string }>('/users/:id', function* (ctx, next) {
    yield next();
    acc += 'a';
  });
  const action2 = api.get('/users2', function* (ctx, next) {
    yield next();
    yield call(action1.run, action1({ id: '1' }));
    acc += 'b';
    t.assert(acc === 'ab');
  });

  const store = setupStore(api.saga());
  store.dispatch(action2());
});

test('run() from a normal saga', (t) => {
  t.plan(2);
  const api = createApi();
  api.use(api.routes());
  let acc = '';
  const action1 = api.get<{ id: string }>('/users/:id', function* (ctx, next) {
    yield next();
    acc += 'a';
  });
  const action2 = createAction('ACTION');
  function* onAction(): SagaIterator {
    const ctx = yield call(action1.run, action1({ id: '1' }));
    const payload = { name: '/users/:id [GET]', options: { id: '1' } };
    t.like(ctx, {
      action: {
        type: '@@saga-query/users/:id [GET]',
        payload,
      },
      name: '/users/:id [GET]',
      payload: { id: '1' },
    });
    acc += 'b';
    t.assert(acc === 'ab');
  }

  function* watchAction() {
    yield takeEvery(`${action2}`, onAction);
  }

  const store = setupStore({ api: api.saga(), watchAction });
  store.dispatch(action2());
});

test('createApi with own key', async (t) => {
  t.plan(1);
  // const name = 'users';
  // const cache = createTable<User>({ name });
  const query = createApi();

  // query.use(queryCtx);
  // query.use(urlParser);
  query.use(requestMonitor());
  query.use(query.routes());
  query.use(function* fetchApi(ctx, next): SagaIterator<any> {
    const data = {
      users: [mockUser],
    };

    ctx.response = new Response(jsonBlob(data), { status: 200 });

    yield next();
  });
  let theTestKey = '';
  const createUser = query.post<{ email: string }>(
    `/users`,
    function* processUsers(ctx: ApiCtx<any, any>, next) {
      ctx.cache = true;
      ctx.key = `users-00-${Math.ceil(Math.random() * 100)}`;
      theTestKey = ctx.key;
      ctx.request = ctx.req({
        method: 'POST',
        body: JSON.stringify({ email: ctx.payload.email }),
      });
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
      yield console.log(ctx.key);
    },
  );

  const reducers = createReducerMap();
  const store = setupStore(query.saga(), reducers);
  store.dispatch(createUser({ email: mockUser.email }));
  await sleep(150);
  const s = await store.getState();
  console.log('the store:', s);

  t.deepEqual(s['@@saga-query/data'][theTestKey], {
    '1': { id: '1', name: 'test', email: 'test@test.com' },
  });
  // todo: test the cache
  // todo: test the loaders (all of them)
});
