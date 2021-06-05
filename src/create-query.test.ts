import test from 'ava';
import createSagaMiddleware from 'redux-saga';
import { put } from 'redux-saga/effects';
import { createReducerMap, MapEntity, createTable } from 'robodux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { urlParser, queryCtx } from './middleware';
import { FetchCtx } from './fetch';
import { createQuery } from './create-query';

interface User {
  id: string;
  name: string;
  email: string;
}

const mockUser: User = { id: '1', name: 'test', email: 'test@test.com' };
const mockUser2: User = { id: '2', name: 'two', email: 'two@test.com' };

function setupStore(
  saga: any,
  reducers: any = { users: (state: any = {}) => state },
) {
  const sagaMiddleware = createSagaMiddleware();
  const reducer = combineReducers(reducers);
  const store: any = createStore(reducer, applyMiddleware(sagaMiddleware));
  sagaMiddleware.run(saga);
  return store;
}

test('createQuery - POST', (t) => {
  t.plan(1);
  const name = 'users';
  const cache = createTable<User>({ name });
  const query = createQuery<FetchCtx>();

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

  const createUser = query.post<{ email: string }>(
    `/users`,
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

test('middleware - with request fn', (t) => {
  t.plan(1);
  const query = createQuery();
  query.use(query.routes());
  query.use(queryCtx);
  query.use(urlParser);
  query.use(function* (ctx, next) {
    t.deepEqual(ctx.request, { method: 'POST', url: '/users' });
  });
  const createUser = query.create('/users', query.request({ method: 'POST' }));
  const store = setupStore(query.saga());
  store.dispatch(createUser());
});

test('run() on endpoint action - should run the effect', (t) => {
  t.plan(1);
  const api = createQuery();
  api.use(api.routes());
  let acc = '';
  const action1 = api.get('/users', function* (ctx, next) {
    yield next();
    acc += 'a';
  });
  const action2 = api.get('/users2', function* (ctx, next) {
    yield next();
    yield action1.run();
    acc += 'b';
    t.assert(acc === 'ab');
  });

  const store = setupStore(api.saga());
  store.dispatch(action2());
});
