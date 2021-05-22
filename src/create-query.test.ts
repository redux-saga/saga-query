import test from 'ava';
import createSagaMiddleware from 'redux-saga';
import { takeLatest, put } from 'redux-saga/effects';
import { createReducerMap, MapEntity } from 'robodux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Next } from './create-api';
import { createQuery, QueryCtx } from './create-query';

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

test('createQuery', (t) => {
  const query = createQuery<User>('users', function* fetchApi(opts) {
    if (opts.url === '/users') {
      const json = {
        users: [mockUser],
      };
      return json;
    } else if (`${opts.url}`.startsWith('/users/')) {
      const json = mockUser2;
      return json;
    }
  });

  const fetchUsers = query.create(
    `/users`,
    function* processUsers(ctx: QueryCtx<{ users: User[] }>, next) {
      yield next();
      const { users } = ctx.response;
      const curUsers = users.reduce<MapEntity<User>>((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});
      yield put(query.actions.add(curUsers));
    },
  );

  const fetchUser = query.create<{ id: string }>(
    `/users/:id`,
    {
      saga: latest,
    },
    function* processUser(ctx: QueryCtx<User, { id: string }>, next) {
      ctx.request = {
        method: 'POST',
      };
      yield next();
      const curUser = ctx.response;
      const curUsers = { [curUser.id]: curUser };
      yield put(query.actions.add(curUsers));
    },
  );

  const reducers = createReducerMap(query);
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
