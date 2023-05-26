import test from 'ava';
import nock from 'nock';
import { race, call, delay as sagaDelay, cancelled } from 'typed-redux-saga';
import { fetcher, fetchRetry } from './fetch';
import { createApi } from './api';
import { setupStore } from './util';
import { requestMonitor } from './middleware';

const baseUrl = 'https://saga-query.com';
const mockUser = { id: '1', email: 'test@saga-query.com' };

const delay = (n: number = 200) =>
  new Promise((resolve) => {
    setTimeout(resolve, n);
  });

test('fetch - should be able to fetch a resource and save automatically', async (t) => {
  t.plan(3);

  nock(baseUrl).get('/users').reply(200, mockUser);

  const api = createApi();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(fetcher({ baseUrl }));

  const fetchUsers = api.get('/users', function* (ctx, next) {
    ctx.cache = true;
    yield next();

    t.deepEqual(ctx.request, {
      url: `${baseUrl}/users`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    t.deepEqual(ctx.json, { ok: true, data: mockUser });
  });

  const store = setupStore(api.saga());
  const action = fetchUsers();
  store.dispatch(action);

  await delay();

  const state = store.getState();
  t.deepEqual(state['@@saga-query/data'][action.payload.key], mockUser);
});

test('fetch - should be able to fetch a resource and parse as text instead of json', async (t) => {
  t.plan(1);

  nock(baseUrl).get('/users').reply(200, 'this is some text');

  const api = createApi();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(fetcher({ baseUrl }));

  const fetchUsers = api.get('/users', function* (ctx, next) {
    ctx.cache = true;
    ctx.bodyType = 'text';
    yield next();
    t.deepEqual(ctx.json, { ok: true, data: 'this is some text' });
  });

  const store = setupStore(api.saga());
  const action = fetchUsers();
  store.dispatch(action);

  await delay();
});

test('fetch - error handling', async (t) => {
  t.plan(2);
  const errMsg = { message: 'something happened' };

  nock(baseUrl).get('/users').reply(500, errMsg);

  const api = createApi();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(function* (ctx, next) {
    const url = ctx.req().url;
    ctx.request = ctx.req({ url: `${baseUrl}${url}` });
    yield next();
  });
  api.use(fetcher());

  const fetchUsers = api.get('/users', function* (ctx, next) {
    ctx.cache = true;
    yield next();

    t.deepEqual(ctx.json, { ok: false, data: errMsg });
  });

  const store = setupStore(api.saga());
  const action = fetchUsers();
  store.dispatch(action);

  await delay();

  const state = store.getState();
  t.deepEqual(state['@@saga-query/data'][action.payload.key], errMsg);
});

test('fetch - status 204', async (t) => {
  t.plan(2);
  nock(baseUrl).get('/users').reply(204);

  const api = createApi();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(function* (ctx, next) {
    const url = ctx.req().url;
    ctx.request = ctx.req({ url: `${baseUrl}${url}` });
    yield next();
  });
  api.use(fetcher());

  const fetchUsers = api.get('/users', function* (ctx, next) {
    ctx.cache = true;
    yield next();

    t.deepEqual(ctx.json, { ok: true, data: {} });
  });

  const store = setupStore(api.saga());
  const action = fetchUsers();
  store.dispatch(action);

  await delay();

  const state = store.getState();
  t.deepEqual(state['@@saga-query/data'][action.payload.key], {});
});

test('fetch - malformed json', async (t) => {
  t.plan(1);
  nock(baseUrl).get('/users').reply(200, 'not json');

  const api = createApi();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(function* (ctx, next) {
    const url = ctx.req().url;
    ctx.request = ctx.req({ url: `${baseUrl}${url}` });
    yield next();
  });
  api.use(fetcher());

  const fetchUsers = api.get('/users', function* (ctx, next) {
    ctx.cache = true;
    yield next();

    t.deepEqual(ctx.json, {
      ok: false,
      data: {
        message:
          'invalid json response body at https://saga-query.com/users reason: Unexpected token o in JSON at position 1',
      },
    });
  });

  const store = setupStore(api.saga());
  const action = fetchUsers();
  store.dispatch(action);

  await delay();
});

test('fetch - POST', async (t) => {
  t.plan(2);
  nock(baseUrl).post('/users').reply(200, mockUser);

  const api = createApi();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(fetcher({ baseUrl }));

  const fetchUsers = api.post('/users', function* (ctx, next) {
    ctx.cache = true;
    ctx.request = ctx.req({ body: JSON.stringify(mockUser) });
    yield next();

    t.deepEqual(ctx.req(), {
      url: `${baseUrl}/users`,
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(mockUser),
    });

    t.deepEqual(ctx.json, { ok: true, data: mockUser });
  });

  const store = setupStore(api.saga());
  const action = fetchUsers();
  store.dispatch(action);

  await delay();
});

test('fetch - POST multiple endpoints with same uri', async (t) => {
  t.plan(4);
  nock(baseUrl).post('/users/1/something').reply(200, mockUser).persist();

  const api = createApi();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(fetcher({ baseUrl }));

  const fetchUsers = api.post<{ id: string }>(
    '/users/:id/something',
    function* (ctx, next) {
      ctx.cache = true;
      ctx.request = ctx.req({ body: JSON.stringify(mockUser) });
      yield next();

      t.deepEqual(ctx.req(), {
        url: `${baseUrl}/users/1/something`,
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(mockUser),
      });

      t.deepEqual(ctx.json, { ok: true, data: mockUser });
    },
  );

  const fetchUsersSecond = api.post<{ id: string }>(
    ['/users/:id/something', 'next'],
    function* (ctx, next) {
      ctx.cache = true;
      ctx.request = ctx.req({ body: JSON.stringify(mockUser) });
      yield next();

      t.deepEqual(ctx.req(), {
        url: `${baseUrl}/users/1/something`,
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(mockUser),
      });

      t.deepEqual(ctx.json, { ok: true, data: mockUser });
    },
  );

  const store = setupStore(api.saga());
  store.dispatch(fetchUsers({ id: '1' }));
  store.dispatch(fetchUsersSecond({ id: '1' }));

  await delay();
});

test('fetch - slug in url but payload has empty string for slug value', async (t) => {
  t.plan(1);

  const api = createApi();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(fetcher({ baseUrl }));

  const fetchUsers = api.post<{ id: string }>(
    '/users/:id',
    function* (ctx, next) {
      ctx.cache = true;
      ctx.request = ctx.req({ body: JSON.stringify(mockUser) });

      yield next();

      t.deepEqual(ctx.json, {
        ok: false,
        data: 'found :id in endpoint name (/users/:id [POST]) but payload has falsy value ()',
      });
    },
  );

  const store = setupStore(api.saga());
  const action = fetchUsers({ id: '' });
  store.dispatch(action);

  await delay();
});

test('fetch retry - with success - should keep retrying fetch request', async (t) => {
  t.plan(2);

  nock(baseUrl).get('/users').reply(400, { message: 'error' });
  nock(baseUrl).get('/users').reply(400, { message: 'error' });
  nock(baseUrl).get('/users').reply(400, { message: 'error' });
  nock(baseUrl).get('/users').reply(400, { message: 'error' });
  nock(baseUrl).get('/users').reply(200, mockUser);

  const api = createApi();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(fetcher({ baseUrl }));

  const fetchUsers = api.get('/users', [
    function* (ctx, next) {
      ctx.cache = true;
      yield next();

      if (!ctx.json.ok) {
        t.fail();
      }

      t.deepEqual(ctx.json, { ok: true, data: mockUser });
    },
    fetchRetry((n) => (n > 4 ? -1 : 10)),
  ]);

  const store = setupStore(api.saga());
  const action = fetchUsers();
  store.dispatch(action);

  await delay();

  const state = store.getState();
  t.deepEqual(state['@@saga-query/data'][action.payload.key], mockUser);
});

test('fetch retry - with failure - should keep retrying and then quit', async (t) => {
  t.plan(1);

  nock(baseUrl).get('/users').reply(400, { message: 'error' });
  nock(baseUrl).get('/users').reply(400, { message: 'error' });
  nock(baseUrl).get('/users').reply(400, { message: 'error' });

  const api = createApi();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(fetcher({ baseUrl }));

  const fetchUsers = api.get('/users', [
    function* (ctx, next) {
      ctx.cache = true;
      yield next();
      t.deepEqual(ctx.json, { ok: false, data: { message: 'error' } });
    },
    fetchRetry((n) => (n > 2 ? -1 : 10)),
  ]);

  const store = setupStore(api.saga());
  const action = fetchUsers();
  store.dispatch(action);

  await delay();
});

test.only('race() with next()', async (t) => {
  t.plan(1);

  nock(baseUrl)
    .get('/users')
    .reply((_uri, _requestBody, cb) => {
      console.log('did i get hit?');
      setTimeout(() => {
        console.log('timeout');
        cb(null, [200, mockUser]);
      }, 1000);
    })
    .persist();

  const api = createApi();
  api.use(function* (ctx, next) {
    try {
      yield next();
    } catch (err) {
      console.error(err);
    } finally {
      console.log('task completed', ctx);
      if (yield* cancelled()) {
        console.log('was cancelled!');
      }
    }
  });
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(fetcher({ baseUrl }));

  const action = api.get('/users', function* myfn(ctx, next) {
    const controller = new AbortController();
    ctx.request = ctx.req({
      signal: controller.signal,
    });

    const result = yield* race({
      one: call(next),
      two: sagaDelay(100),
    });

    console.log(result);
    if (result.two) {
      console.log('here i am');
      controller.abort();
      t.pass();
      return;
    }

    t.fail();
  });

  const store = setupStore({ api: api.saga() });
  store.dispatch(action());

  await delay(1500);
});
