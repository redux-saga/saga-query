import test from 'ava';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { put } from 'redux-saga/effects';
import { createTable, Action, MapEntity, createReducerMap } from 'robodux';

import { Middleware, Next, createApi } from './create-api';
import { CreateActionPayload } from './types';

interface RoboCtx<D = any, P = any> {
  payload: CreateActionPayload<P>;
  url: string;
  request: any;
  response: D;
  actions: Action[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserResponse {
  id: string;
  name: string;
  email_address: string;
}

const deserializeUser = (u: UserResponse): User => {
  return {
    id: u.id,
    name: u.name,
    email: u.email_address,
  };
};

interface Ticket {
  id: string;
  name: string;
}

interface TicketResponse {
  id: string;
  name: string;
}

const deserializeTicket = (u: TicketResponse): Ticket => {
  return {
    id: u.id,
    name: u.name,
  };
};

const users = createTable<User>({ name: 'USER' });
const tickets = createTable<Ticket>({ name: 'TICKET' });
const reducers = createReducerMap(users, tickets);

interface FetchApiOpts {
  url: RequestInfo;
  options?: RequestInit;
}

const mockUser = { id: '1', name: 'test', email_address: 'test@test.com' };
const mockTicket = { id: '2', name: 'test-ticket' };

function* convertNameToUrl(ctx: RoboCtx, next: Next) {
  if (!ctx.url) {
    ctx.url = ctx.payload.name;
  }
  yield next();
}

function* onFetchApi(ctx: RoboCtx, next: Next) {
  const url = ctx.url;
  let json = {};
  if (url === '/users') {
    json = {
      users: [mockUser],
    };
  }

  if (url === '/tickets') {
    json = {
      tickets: [mockTicket],
    };
  }

  ctx.response = json;
  yield next();
}

function* setupActionState(ctx: RoboCtx, next: Next) {
  ctx.actions = [];
  yield next();
}

function* processUsers(ctx: RoboCtx<{ users?: UserResponse[] }>, next: Next) {
  if (!ctx.response.users) {
    yield next();
    return;
  }
  const curUsers = ctx.response.users.reduce<MapEntity<User>>((acc, u) => {
    acc[u.id] = deserializeUser(u);
    return acc;
  }, {});
  ctx.actions.push(users.actions.add(curUsers));
  yield next();
}

function* processTickets(
  ctx: RoboCtx<{ tickets?: UserResponse[] }>,
  next: Next,
) {
  if (!ctx.response.tickets) {
    yield next();
    return;
  }
  const curTickets = ctx.response.tickets.reduce<MapEntity<Ticket>>(
    (acc, u) => {
      acc[u.id] = deserializeTicket(u);
      return acc;
    },
    {},
  );
  ctx.actions.push(tickets.actions.add(curTickets));
  yield next();
}

function* saveToRedux(ctx: RoboCtx, next: Next) {
  for (let i = 0; i < ctx.actions.length; i += 1) {
    const action = ctx.actions[i];
    yield put(action);
  }
  yield next();
}

function setupStore(saga: any) {
  const sagaMiddleware = createSagaMiddleware();
  const reducer = combineReducers(reducers as any);
  const store: any = createStore(reducer, applyMiddleware(sagaMiddleware));
  sagaMiddleware.run(saga);
  return store;
}

test('createApi: when create a query fetch pipeline - execute all middleware and save to redux', (t) => {
  const api = createApi<RoboCtx>();
  api.use(convertNameToUrl);
  api.use(onFetchApi);
  api.use(setupActionState);
  api.use(processUsers);
  api.use(processTickets);
  api.use(saveToRedux);
  const fetchUsers = api.create(`/users`);

  const store = setupStore(api.saga());
  store.dispatch(fetchUsers());
  t.deepEqual(store.getState(), {
    [users.name]: { [mockUser.id]: deserializeUser(mockUser) },
    [tickets.name]: {},
  });
});

test('createApi: when providing a generator the to api.create function - should call that generator before all other middleware', (t) => {
  t.plan(2);
  const api = createApi<RoboCtx>();
  api.use(convertNameToUrl);
  api.use(onFetchApi);
  api.use(setupActionState);
  api.use(processUsers);
  api.use(processTickets);
  api.use(saveToRedux);
  const fetchUsers = api.create(`/users`);
  const fetchTickets = api.create(`/ticket-wrong-url`, function* (ctx, next) {
    // before middleware has been triggered
    ctx.url = '/tickets';

    // triggers all middleware
    yield next();

    // after middleware has been triggered
    t.deepEqual(ctx.actions, [
      tickets.actions.add({
        [mockTicket.id]: deserializeTicket(mockTicket),
      }),
    ]);
    yield put(fetchUsers());
  });

  const store = setupStore(api.saga());
  store.dispatch(fetchTickets());
  t.deepEqual(store.getState(), {
    [users.name]: { [mockUser.id]: deserializeUser(mockUser) },
    [tickets.name]: { [mockTicket.id]: deserializeTicket(mockTicket) },
  });
});

test('error handling', (t) => {
  t.plan(1);
  const api = createApi<RoboCtx>();
  api.use(function* upstream(ctx, next) {
    try {
      yield next();
    } catch (err) {
      t.pass();
    }
  });
  api.use(function* fail() {
    throw new Error('some error');
  });

  const action = api.create(`/error`);
  const store = setupStore(api.saga());
  store.dispatch(action());
});

test('error handling inside create', (t) => {
  t.plan(1);
  const api = createApi<RoboCtx>();
  api.use(function* fail() {
    throw new Error('some error');
  });

  const action = api.create(`/error`, function* (ctx, next) {
    try {
      yield next();
    } catch (err) {
      t.pass();
    }
  });
  const store = setupStore(api.saga());
  store.dispatch(action());
});

test('error handling - error handler', (t) => {
  t.plan(1);
  const api = createApi<RoboCtx>({
    onError: (err: Error) => t.assert(err.message === 'failure'),
  });
  api.use(function* upstream(ctx, next) {
    throw new Error('failure');
  });

  const action = api.create(`/error`);
  const store = setupStore(api.saga());
  store.dispatch(action());
});

test('create fn is an array', (t) => {
  t.plan(1);
  const api = createApi<RoboCtx>();
  api.use(function* (ctx, next) {
    t.deepEqual(ctx.request, {
      method: 'POST',
      body: {
        test: 'me',
      },
    });
    yield next();
  });
  const action = api.create('/users', [
    function* (ctx, next) {
      ctx.request = {
        method: 'POST',
      };
      yield next();
    },
    function* (ctx, next) {
      ctx.request.body = { test: 'me' };
      yield next();
    },
  ]);

  const store = setupStore(api.saga());
  store.dispatch(action());
});

test('run() on endpoint action - should run the effect', (t) => {
  t.plan(2);
  const api = createApi<RoboCtx>();
  let acc = '';
  const action1 = api.create('/users', function* (ctx, next) {
    yield next();
    ctx.request = 'expect this';
    acc += 'a';
  });
  const action2 = api.create('/users2', function* (ctx, next): Generator {
    yield next();
    const curCtx = yield action1.run();
    acc += 'b';
    t.assert(acc === 'ab');
    t.deepEqual(curCtx, {
      payload: { name: '/users', options: undefined },
      request: 'expect this',
    });
  });

  const store = setupStore(api.saga());
  store.dispatch(action2());
});
