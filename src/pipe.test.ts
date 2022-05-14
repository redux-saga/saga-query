import test from 'ava';
import type { SagaIterator } from 'redux-saga';
import { put, call, delay } from 'redux-saga/effects';
import { createTable, createReducerMap } from 'robodux';
import type { Action, MapEntity } from 'robodux';

import { createPipe } from './pipe';
import type { PipeCtx, Next, ActionWithPayload } from './types';
import { setupStore as prepStore } from './util';
import { createQueryState } from './slice';

import { createApi } from './api';
import { poll } from './middleware';
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
  const api = createPipe<RoboCtx>();
  api.use(api.routes());
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
    function* (ctx, next): SagaIterator<void> {
      yield next();
      const curCtx = yield call(action1.run, action1());
      acc += 'b';
      t.assert(acc === 'ab');
      t.like(curCtx, {
        action: {
          type: '@@saga-query/users',
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

const sleep = (n: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, n);
  });

test('middleware order of execution', async (t) => {
  t.plan(1);
  let acc = '';
  const api = createPipe();
  api.use(api.routes());

  api.use(function* (ctx, next) {
    yield delay(10);
    acc += 'b';
    yield next();
    yield delay(10);
    acc += 'f';
  });

  api.use(function* (ctx, next) {
    acc += 'c';
    yield next();
    acc += 'd';
    yield delay(30);
    acc += 'e';
  });

  const action = api.create('/api', function* (ctx, next) {
    acc += 'a';
    yield next();
    acc += 'g';
  });

  const store = setupStore(api.saga());
  store.dispatch(action());

  await sleep(150);
  t.assert(acc === 'abcdefg');
});

const getKeyOf = (action: ActionWithPayload<any> | Action): string =>
  action.payload.key;

test('options object keys order for action key identity - 0: empty options', (t) => {
  t.plan(1);
  const api = createApi();
  api.use(api.routes());
  // no param
  const action0 = api.get(
    '/users',
    { saga: poll(5 * 1000) }, // with poll middleware
    function* (ctx, next) {
      ctx.request = {
        method: 'GET',
      };
      yield next();
    },
  );
  const sendNop0 = action0();
  const sendNop1 = action0();
  t.assert(getKeyOf(sendNop0) === getKeyOf(sendNop1));
});

test('options object keys order for action key identity - 1: simple object', (t) => {
  t.plan(4);
  const api = createApi();
  api.use(api.routes());
  // no param
  const action0 = api.get<any>(
    '/users',
    { saga: poll(5 * 1000) }, // with poll middleware
    function* (ctx, next) {
      ctx.request = {
        method: 'GET',
      };
      yield next();
    },
  );
  const sendPojo0 = action0({
    a: 'a',
    b: 'b',
    c: 1,
    d: 2,
    e: true,
    f: false,
    '100': 100,
    101: '101',
  });
  const sendPojo1 = action0({
    a: 'a',
    b: 'b',
    c: 1,
    d: 2,
    e: true,
    f: false,
    100: 100,
    101: '101',
  });
  const sendPojo2 = action0({
    e: true,
    f: false,
    '100': 100,
    '101': '101',
    a: 'a',
    b: 'b',
    c: 1,
    d: 2,
  });
  const sendPojo3 = action0({
    e: true,
    f: false,
    '100': 100,
    '101': '101',
    a: 'a',
    b: 'b',
    c: 1,
    d: 2000000,
  });
  const sendPojo4 = action0({
    e: null,
    f: false,
    '100': undefined,
    '101': '101',
    a: 'a',
    b: 'b',
    c: 1,
    d: `Thomas O'Malley`,
  });
  const sendPojo5 = action0({
    d: `Thomas O'Malley`,
    e: null,
    f: false,
    '100': undefined,
    '101': '101',
    a: 'a',
    b: 'b',
    c: 1,
  });
  t.assert(getKeyOf(sendPojo0) === getKeyOf(sendPojo1));
  t.assert(getKeyOf(sendPojo0) === getKeyOf(sendPojo2));
  t.assert(getKeyOf(sendPojo0) !== getKeyOf(sendPojo3));
  t.assert(getKeyOf(sendPojo4) === getKeyOf(sendPojo5));
});

test('options object keys order for action key identity - 2: object (with array values)', (t) => {
  interface Ip0 {
    param1: string;
    param2: string[];
  }
  t.plan(2);
  const api = createApi();
  api.use(api.routes());
  const action = api.get<Ip0>('/users/:param1/:param2', function* (ctx, next) {
    ctx.request = {
      method: 'GET',
    };
    yield next();
  });
  const sendFirst = action({ param1: '1', param2: ['2', 'e', 'f'] });
  const sendSecond = action({ param2: ['2', 'f', 'e'], param1: '1' });
  const sendThird = action({ param2: ['2', 'e', 'f'], param1: '1' });
  t.assert(getKeyOf(sendFirst) !== getKeyOf(sendSecond)); // array is different
  t.assert(getKeyOf(sendFirst) === getKeyOf(sendThird)); // object has same keys same values
});

test('options object keys order for action key identity - 3: nested object', (t) => {
  interface Ip0 {
    param1: string;
    param2: string[];
  }
  interface Ip1 {
    param1: string;
    param2: string;
    param3: number;
    param4: Ip0;
    param5: boolean;
  }
  const o1: Ip1 = {
    param1: '1',
    param2: '2',
    param3: 3,
    param4: {
      param1: '4',
      param2: ['5', '6'],
    },
    param5: true,
  };
  const o2: Ip1 = {
    param4: {
      param1: '4',
      param2: ['5', '6'],
    },
    param5: true,
    param2: '2',
    param1: '1',
    param3: 3,
  };
  t.plan(2);
  const api = createApi();
  api.use(api.routes());
  //nested with array
  const action2 = api.get<Ip1>(
    '/users/:param1/:param2/:param3/:param4/:param5',
    function* (ctx, next) {
      ctx.request = {
        method: 'GET',
      };
      yield next();
    },
  );
  const sendO1 = action2(o1);
  const sendO2 = action2(o2);
  const sendO3 = action2({
    ...o1,
    param4: { ...o1.param4, param2: ['5', '6', '7'] },
  });
  t.assert(getKeyOf(sendO1) === getKeyOf(sendO2));
  t.assert(getKeyOf(sendO1) !== getKeyOf(sendO3));
});

test('options object keys order for action key identity - 4: deepNested object', (t) => {
  interface Ip0 {
    param1: string;
    param2: string[];
  }
  interface Ip1 {
    param1: string;
    param2: string;
    param3: number;
    param4: Ip0;
    param5: boolean;
  }
  interface Ip3 {
    param1: string;
    param2: {
      param3: Ip1;
      param4: Ip0;
    };
  }
  const o1: Ip1 = {
    param1: '1',
    param2: '2',
    param3: 3,
    param4: {
      param1: '4',
      param2: ['5', '6'],
    },
    param5: true,
  };
  const o2: Ip1 = {
    param4: {
      param1: '4',
      param2: ['5', '6'],
    },
    param5: true,
    param1: '1',
    param2: '2',
    param3: 3,
  };
  const oo1: Ip3 = {
    param1: '1',
    param2: {
      param3: o1,
      param4: {
        param1: '4',
        param2: ['5', '6'],
      },
    },
  };
  const oo2: Ip3 = {
    param1: '1',
    param2: {
      param4: {
        param1: '4',
        param2: ['5', '6'],
      },
      param3: o1,
    },
  };
  t.plan(4);
  const api = createApi();
  api.use(api.routes());
  // deepNested
  const action4 = api.get<Ip3>(
    '/users/:param1/:param2/:param3/:param4/:param5',
    function* (ctx, next) {
      ctx.request = {
        method: 'GET',
      };
      yield next();
    },
  );
  const send_oo1 = action4(oo1);
  const send_oo1_shuff = action4({ param2: oo1.param2, param1: oo1.param1 });
  const send_oo1_value_changed = action4({ ...oo1, param1: 'x' });
  const send_oo2 = action4(oo2);
  t.deepEqual(send_oo1.payload.options, send_oo2.payload.options);
  t.assert(getKeyOf(send_oo1) === getKeyOf(send_oo1_shuff));
  t.assert(getKeyOf(send_oo1) !== getKeyOf(send_oo1_value_changed));
  t.assert(getKeyOf(send_oo1) === getKeyOf(send_oo2)); // deep nested shuffled //
});

test('options object keys order for action key identity - 5: other', (t) => {
  t.plan(10);
  const api = createApi();
  api.use(api.routes());
  //array options
  const action5 = api.post<any>('/users/:allRecords', function* (ctx, next) {
    ctx.request = {
      method: 'POST',
      body: JSON.stringify(ctx.action.payload),
    };
    yield next();
  });
  const primNo1 = action5(1);
  const primNo1bis = action5(1);
  const primNo2 = action5(2);
  const str1 = action5('1234');
  const str1bis = action5('1234');
  const str2 = action5('2345');
  const aStrings1 = action5(['1', '2', '3']);
  const aStrings2 = action5(['1', '2', '3']);
  const aStrings3 = action5(['1', '2', '1']);
  const aObjects1 = action5([
    { param1: '1', param2: ['2', '3'] },
    { param1: '2', param2: ['2', '3'] },
  ]);
  const aObjects2 = action5([
    { param1: '1', param2: ['2', '3'] },
    { param1: '2', param2: ['2', '3'] },
  ]);
  // the objects are not identical.
  const aObjects3 = action5([
    { param1: '1', param2: ['2', '3'] },
    { param1: '2', param2: ['2', 3] },
  ]);
  //object inside the array is shuffled
  const aObjects4 = action5([
    { param2: ['2', '3'], param1: '1' },
    { param2: ['2', '3'], param1: '2' },
  ]);
  // cont the order of array elements is changed will get different keys.
  const aObjects5 = action5([
    { param1: '2', param2: ['2', '3'] },
    { param1: '1', param2: ['2', '3'] },
  ]);
  t.assert(getKeyOf(primNo1) !== getKeyOf(primNo2));
  t.assert(getKeyOf(primNo1) === getKeyOf(primNo1bis));
  t.assert(getKeyOf(str1) !== getKeyOf(str2));
  t.assert(getKeyOf(str1) === getKeyOf(str1bis));
  t.assert(getKeyOf(aStrings1) === getKeyOf(aStrings2));
  t.assert(getKeyOf(aStrings1) !== getKeyOf(aStrings3));
  t.assert(getKeyOf(aObjects1) === getKeyOf(aObjects2));
  t.assert(getKeyOf(aObjects1) !== getKeyOf(aObjects3));
  t.assert(getKeyOf(aObjects1) === getKeyOf(aObjects4));
  t.assert(getKeyOf(aObjects1) !== getKeyOf(aObjects5));
});
