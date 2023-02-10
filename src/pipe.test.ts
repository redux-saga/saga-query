import test from 'ava';
import type { SagaIterator } from 'redux-saga';
import { put, call, delay } from 'typed-redux-saga';
import { createTable, createReducerMap } from 'robodux';
import type { Action, MapEntity } from 'robodux';

import { createPipe } from './pipe';
import type { PipeCtx, Next } from './types';
import { setupStore as prepStore, sleep } from './util';
import { createQueryState } from './slice';

interface RoboCtx<D = any, P = any> extends PipeCtx<P> {
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

const mockUser = { id: '1', name: 'test', email_address: 'test@test.com' };
const mockTicket = { id: '2', name: 'test-ticket' };

function* convertNameToUrl(ctx: RoboCtx, next: Next) {
  if (!ctx.url) {
    ctx.url = ctx.name;
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
  const store = prepStore(saga, reducers);
  return store;
}

test('createPipe: when create a query fetch pipeline - execute all middleware and save to redux', (t) => {
  const api = createPipe<RoboCtx>();
  api.use(api.routes());
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
    ...createQueryState(),
    [users.name]: { [mockUser.id]: deserializeUser(mockUser) },
    [tickets.name]: {},
  });
});

test('createPipe: when providing a generator the to api.create function - should call that generator before all other middleware', (t) => {
  t.plan(2);
  const api = createPipe<RoboCtx>();
  api.use(api.routes());
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
    ...createQueryState(),
    [users.name]: { [mockUser.id]: deserializeUser(mockUser) },
    [tickets.name]: { [mockTicket.id]: deserializeTicket(mockTicket) },
  });
});

test('error handling', (t) => {
  t.plan(1);
  const api = createPipe<RoboCtx>();
  api.use(api.routes());
  api.use(function* upstream(_, next) {
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
  const api = createPipe<RoboCtx>();
  api.use(api.routes());
  api.use(function* fail() {
    throw new Error('some error');
  });

  const action = api.create(`/error`, function* (_, next) {
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
  const api = createPipe<RoboCtx>({
    onError: (err: Error) => t.assert(err.message === 'failure'),
  });
  api.use(api.routes());
  api.use(function* upstream() {
    throw new Error('failure');
  });

  const action = api.create(`/error`);
  const store = setupStore(api.saga());
  store.dispatch(action());
});

test('create fn is an array', (t) => {
  t.plan(1);
  const api = createPipe<RoboCtx>();
  api.use(api.routes());
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
  const api = createPipe<RoboCtx>();
  api.use(api.routes());
  let acc = '';
  const action1 = api.create('/users', function* (ctx, next) {
    yield next();
    ctx.request = 'expect this';
    acc += 'a';
  });
  const action2 = api.create(
    '/users2',
    function* (_, next): SagaIterator<void> {
      yield next();
      const curCtx = yield* call(action1.run, action1());
      acc += 'b';
      t.assert(acc === 'ab');
      t.like(curCtx, {
        action: {
          type: `@@saga-query${action1}`,
          payload: {
            name: '/users',
          },
        },
        name: '/users',
        request: 'expect this',
      });
    },
  );

  const store = setupStore(api.saga());
  store.dispatch(action2());
});

test('middleware order of execution', async (t) => {
  t.plan(1);
  let acc = '';
  const api = createPipe();
  api.use(api.routes());

  api.use(function* (_, next) {
    yield delay(10);
    acc += 'b';
    yield next();
    yield delay(10);
    acc += 'f';
  });

  api.use(function* (_, next) {
    acc += 'c';
    yield next();
    acc += 'd';
    yield delay(30);
    acc += 'e';
  });

  const action = api.create('/api', function* (_, next) {
    acc += 'a';
    yield next();
    acc += 'g';
  });

  const store = setupStore(api.saga());
  store.dispatch(action());

  await sleep(150);
  t.assert(acc === 'abcdefg');
});

test('retry with actionFn', async (t) => {
  t.plan(1);
  let acc = '';
  let called = false;

  const api = createPipe();
  api.use(api.routes());

  const action = api.create('/api', function* (ctx, next) {
    acc += 'a';
    yield next();
    acc += 'g';

    if (!called) {
      called = true;
      yield put(ctx.actionFn());
    }
  });

  const store = setupStore(api.saga());
  store.dispatch(action());

  await sleep(150);
  t.deepEqual(acc, 'agag');
});

test('retry with actionFn with payload', async (t) => {
  t.plan(1);
  let acc = '';
  const api = createPipe();
  api.use(api.routes());

  api.use(function* (ctx: PipeCtx<{ page: number }>, next) {
    yield next();
    if (ctx.payload.page == 1) {
      yield put(ctx.actionFn({ page: 2 }));
    }
  });

  const action = api.create<{ page: number }>('/api', function* (_, next) {
    acc += 'a';
    yield next();
    acc += 'g';
  });

  const store = setupStore(api.saga());
  store.dispatch(action({ page: 1 }));

  await sleep(150);
  t.deepEqual(acc, 'aagg');
});
