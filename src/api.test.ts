import test from 'ava';
import type { SagaIterator } from 'redux-saga';
import { takeEvery, put, call } from 'redux-saga/effects';
import { createAction, createReducerMap, createTable } from 'robodux';
import type { MapEntity } from 'robodux';
import { Buffer } from 'buffer';

import { urlParser, queryCtx, requestMonitor } from './middleware';
import { createApi } from './api';
import { setupStore, sleep } from './util';
import { createKey } from './create-key';
import type { ApiCtx } from './types';
import { poll } from './saga';

interface User {
  id: string;
  name: string;
  email: string;
}

const mockUser: User = { id: '1', name: 'test', email: 'test@test.com' };

const jsonBlob = (data: any) => {
  return Buffer.from(JSON.stringify(data));
};

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
  const api = createApi<TestCtx>();
  api.use(api.routes());
  let acc = '';
  const action1 = api.get<{ id: string }, { result: boolean }>(
    '/users/:id',
    function* (ctx, next) {
      yield next();
      acc += 'a';
    },
  );
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
        type: `@@saga-query${action1}`,
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

test('createApi with hash key on a large post', async (t) => {
  t.plan(2);
  const query = createApi();
  query.use(requestMonitor());
  query.use(query.routes());
  query.use(function* fetchApi(ctx, next): SagaIterator<any> {
    const data = {
      users: [{ ...mockUser, ...ctx.action.payload.options }],
    };
    ctx.response = new Response(jsonBlob(data), { status: 200 });
    yield next();
  });
  const createUserDefaultKey = query.post<{ email: string; largetext: string }>(
    `/users`,
    function* processUsers(ctx: ApiCtx<any, any>, next) {
      ctx.cache = true;
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

  const email = mockUser.email + '9';
  const largetext = 'abc-def-ghi-jkl-mno-pqr'.repeat(100);
  const reducers = createReducerMap();
  const store = setupStore(query.saga(), reducers);
  store.dispatch(createUserDefaultKey({ email, largetext }));
  await sleep(150);
  const s = store.getState();
  const expectedKey = createKey(`${createUserDefaultKey}`, {
    email,
    largetext,
  });

  t.assert(
    [8, 9].includes(expectedKey.split('|')[1].length),
    'key should  consist of optional "-" followed by 8 chars; Actual length: ' +
      expectedKey.split('|')[1].length,
  );

  t.deepEqual(s['@@saga-query/data'][expectedKey], {
    '1': { id: '1', name: 'test', email: email, largetext: largetext },
  });
});

test('createApi - two identical endpoints', async (t) => {
  const actual: string[] = [];
  const api = createApi();
  api.use(requestMonitor());
  api.use(api.routes());

  const first = api.get('/health', function* (ctx, next) {
    actual.push(ctx.req().url);
    yield next();
  });

  const second = api.get(
    ['/health', 'poll'],
    { saga: poll(1 * 1000) },
    function* (ctx, next) {
      actual.push(ctx.req().url);
      yield next();
    },
  );

  const store = setupStore(api.saga());
  store.dispatch(first());
  store.dispatch(second());

  await sleep(150);

  // stop poll
  store.dispatch(second());

  t.deepEqual(actual, ['/health', '/health']);
});

interface TestCtx<P = any, S = any, E = any> extends ApiCtx<P, S, E> {
  something: boolean;
}

// this is strictly for testing types
test.only('ensure types for get() endpoint', (t) => {
  t.plan(1);
  const api = createApi<TestCtx>();
  api.use(api.routes());
  api.use(function* (ctx, next) {
    yield next();
    ctx.json = { ok: true, data: { result: 'wow' } };
  });

  const acc: string[] = [];
  const action1 = api.get<{ id: string }, { result: string }>(
    '/users/:id',
    function* (ctx, next) {
      ctx.something = false;
      acc.push(ctx.payload.id);

      yield next();

      if (ctx.json.ok) {
        acc.push(ctx.json.data.result);
      }
    },
  );

  const store = setupStore(api.saga());
  store.dispatch(action1({ id: '1' }));
  t.deepEqual(acc, ['1', 'wow']);
});

interface FetchUserProps {
  id: string;
}
type FetchUserCtx = TestCtx<FetchUserProps>;

// this is strictly for testing types
test.only('ensure ability to case `ctx` in function definition', (t) => {
  t.plan(1);
  const api = createApi<TestCtx>();
  api.use(api.routes());
  api.use(function* (ctx, next) {
    yield next();
    ctx.json = { ok: true, data: { result: 'wow' } };
  });

  const acc: string[] = [];
  const action1 = api.get<FetchUserProps>(
    '/users/:id',
    function* (ctx: FetchUserCtx, next) {
      ctx.something = false;
      acc.push(ctx.payload.id);

      yield next();

      if (ctx.json.ok) {
        acc.push(ctx.json.data.result);
      }
    },
  );

  const store = setupStore(api.saga());
  store.dispatch(action1({ id: '1' }));
  t.deepEqual(acc, ['1', 'wow']);
});
