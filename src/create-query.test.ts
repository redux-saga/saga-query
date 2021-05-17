import test from 'ava';
import createSagaMiddleware from 'redux-saga';
import { takeLatest, put } from 'redux-saga/effects';
import { createReducerMap, MapEntity } from 'robodux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createQuery, QueryCtx } from './create-query';

interface User {
  id: string;
  name: string;
  email: string;
}

const mockUser: User = { id: '1', name: 'test', email: 'test@test.com' };

function setupStore(saga: any, reducers: any) {
  const sagaMiddleware = createSagaMiddleware();
  const reducer = combineReducers(reducers);
  const store: any = createStore(reducer, applyMiddleware(sagaMiddleware));
  sagaMiddleware.run(saga);
  return store;
}

function* latest(action: string, saga: any) {
  yield takeLatest(`${action}`, saga);
}

test('createQuery', (t) => {
  const query = createQuery<User>('users', function* fetchApi(opts) {
    // fake fetch
    const json = {
      users: [mockUser],
    };
    return json;
  });

  const fetchUsers = () =>
    query.create(
      { url: '/users' },
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

  const fetchUser = (id: string) =>
    query.create(
      {
        url: `/users/${id}`,
        saga: latest,
      },
      function* processUser(ctx: QueryCtx<User>, next) {
        yield next();
        const user = ctx.response;
        const curUsers = { [user.id]: user };
        yield put(query.actions.add(curUsers));
      },
    );

  const reducers = createReducerMap(query);
  const store = setupStore(query.saga, reducers);
  store.dispatch(fetchUsers());
  store.dispatch(fetchUser('1'));
});
