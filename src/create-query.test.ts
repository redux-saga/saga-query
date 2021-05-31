import test from 'ava';
import createSagaMiddleware from 'redux-saga';
import { put } from 'redux-saga/effects';
import { createReducerMap, MapEntity, createTable } from 'robodux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { FetchCtx, urlParser, fetchBody } from './middleware';
import { createQuery } from './create-query';
import { request } from './';

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

test('createQuery - POST', (t) => {
  t.plan(1);
  const name = 'users';
  const cache = createTable<User>({ name });
  const query = createQuery<FetchCtx>();

  query.use(fetchBody);
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
        body: JSON.stringify({ email: ctx.payload.options.email }),
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
  query.use(fetchBody);
  query.use(urlParser);
  query.use(function* (ctx, next) {
    t.deepEqual(ctx.request, { method: 'POST', url: '/users' });
  });
  const createUser = query.create('/users', request({ method: 'POST' }));
  const store = setupStore(query.saga(), (state: any) => state);
  store.dispatch(createUser());
});
