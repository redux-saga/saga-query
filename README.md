# saga-query

[![ci](https://github.com/redux-saga/saga-query/actions/workflows/test.yml/badge.svg)](https://github.com/redux-saga/saga-query/actions/workflows/test.yml)

Control your data cache on the front-end.

Data fetching and caching using a robust middleware system. Quickly build data loading within your 
redux application and reduce boilerplate.

**This library is undergoing active development. Consider this in a beta
state.**

- [Examples](#examples)
- [Control your data cache](#control-your-data-cache)
- [Manipulating the request](#manipulating-the-request)
- [Auto caching](#auto-caching)
- [Dispatching many actions](#dispatching-many-actions)
- [Dependent queries](#dependent-queries)
- [Dynamic endpoints](#dynamic-endpoints)
- [Error handling](#error-handling)
- [Loading state](#loading-state)
- [React](#react)
- [Cache timer](#cache-timer)
- [Take leading](#take-leading)
- [Polling](#polling)
- [Optimistic UI](#optimistic-ui)
- [Undo](#undo)
- [Performance monitor](#performance-monitor)
- [redux-toolkit](#redux-toolkit)

## Features

- Write middleware to handle fetching, synchronizing, and caching API requests
  on the front-end
- A middleware system that node.js developers are familiar with
  (e.g. express.js, koa.js)
- Automatically track loading states for data fetching
- Automatically cache data in redux
- Simple recipes to handle complex use-cases like cancellation, polling,
  optimistic updates, loading states, undo
- React hooks to make it even easier to use in react applications
- Full control over the data fetching and caching layers in your application
- Fine tune selectors for your specific needs

```ts
// api.ts
import { createApi, requestMonitor, fetcher } from 'saga-query';

const api = createApi();
api.use(requestMonitor());
api.use(api.routes());
api.use(fetcher({ baseUrl: 'https://api.github.com' }));

export const fetchRepo = api.get(
  `/repos/redux-saga/saga-query`,
  api.cache()
);
```

```tsx
// app.tsx
import React, { useEffect } from 'react';
import { useCache } from 'saga-query/react';
import { fetchRepo } from './api';

interface Repo {
  name: string;
  stargazers_count: number;
}

const useRepo = () => {
  const cache = useCache<Repo>(fetchRepo());

  useEffect(() => {
    cache.trigger();
  }, []);

  return cache;
}

const App = () => {
  const { data, isInitialLoading, isError, message } = useRepo();

  if (isInitialLoading) return <div>Loading ...</div>
  if (isError) return <div>{message}</div>

  return (
    <div>
      <div>{data.name}</div>
      <div>{data.stargazers_count}</div>
    </div>
  );
}
```

## Why?

Libraries like [react-query](https://react-query.tanstack.com/),
[rtk-query](https://rtk-query-docs.netlify.app/), and
[apollo-client](https://www.apollographql.com/docs/react/) are making it
easier than ever to fetch and cache data from an API server.  All of them
have their unique attributes and I encourage everyone to check them out.

There's no better async flow control system than `redux-saga`.  Treating
side-effects as data makes testing dead simple and provides a powerful effect
handling system to accommodate any use-case.  Features like polling, data loading
states, cancellation, racing, parallelization, optimistic updates, and undo are
at your disposal when using `redux-saga`.  Other libraries and paradigms can
also accomplish the same tasks, but I think nothing rivals the readability and
maintainability of redux/redux-saga.

All three libraries above are reinventing async flow control and hiding them
from the end-developer.  For the happy path, this works beautifully.  Why learn
how to cache API data when a library can do it for you?  However:

- What happens when [`useMemo` isn't good
  enough](https://medium.com/swlh/should-you-use-usememo-in-react-a-benchmarked-analysis-159faf6609b7)?
- What happens when the data syncing library lacks the caching granularity you
  need?
- What happens when the data syncing library doesn't cache things in an
  optimized way for your needs?
- What happens when you want to reuse your business logic for another platform
(e.g. a cli) and can't use `react`?

This library is built to support both small and large scale, complex flow control applications
that need full control over the data cache layer while setting good standards
for using redux and a flexible middleware to handle all business logic.

## Core principles

- The end-developer should have full control over fetching/caching/querying
  their server data
- Fetching and caching data should be separate from the view layer
- We should treat side-effects as data
- Sagas are the central processing unit for IO/business logic
- A minimal API that encourages end-developers to write code instead of
  configuring objects

## `saga-query` is *not*

- A DSL wrapped around data fetching and caching logic
- A one-line solution to fetch and cache server data automatically

### Examples

- [Simple](https://codesandbox.io/s/saga-query-simple-ifcwf)
- [With Loader](https://codesandbox.io/s/saga-query-basic-jtceo)
- [Polling](https://codesandbox.io/s/saga-query-polling-1fwfo)
- [Optimistic update](https://codesandbox.io/s/saga-query-optimistic-xwzz2)
- [Undo](https://codesandbox.io/s/saga-query-undo-nn7fn)

## How does it work?

`createApi` will build a set of actions and sagas for each `create` or http
method used (e.g. `get`, `post`, `put`).  Let's call them endpoints.  Each
endpoint gets their own action and linked saga.  When you call `api.saga()` it
loops through all the endpoints and creates a root saga that is fault tolerant
(one saga won't crash all the other sagas).  The default for each endpoint is to
use `takeEvery` from `redux-saga` but as you'll see in other recipes, this can
be easily overridden.

The middleware that is loaded into the query via `.use(...)` gets added to an
array.  This array becomes a pipeline that each endpoint calls in order.  When
`yield next()` is called inside the middleware or an endpoint, it calls the
next middleware in the stack until it finishes.  Everything after `yield
next()` gets called after all the middleware ahead of the current middleware
finishes its execution.

Here's a test that demonstrates the order of execution:

```ts
test('middleware order of execution', async (t) => {
  t.plan(1);
  let acc = '';
  const api = createApi();
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

  await sleep(60);
  t.assert(acc === 'abcdefg');
});
```

The actions created from `saga-query` are JSON serializable.  We are **not**
passing middleware functions through our actions.  This is a design decision to
support things like [inter-process
communication](https://www.electronjs.org/docs/api/ipc-main).

## Control your data cache

```ts
import {
  createApi,
  requestMonitor,
  // ApiCtx is an interface that's built around using window.fetch
  // You don't have to use it if you don't want to.
  ApiCtx,
  put,
  call
} from 'saga-query';
import { createSlice } from '@reduxjs/toolkit';

interface MapEntity<E> {
  [key: string]: E | undefined;
}

// create a reducer that acts like a SQL database table
// the keys are the id and the value is the record
const users = createSlice({
  name: 'users',
  initialState: {},
  reducers: {
    add: (state, action) => {
      action.payload.forEach((user) => {
        state[user.id] = user.id;
      });
    }
  }
});

// something awesome happens in here
// The default generic value here is `ApiCtx` which includes a `payload`,
// `request`, and `response`.
// The generic passed to `createApi` must extend `ApiCtx` to be accepted.
const api = createApi<ApiCtx>();

// This middleware monitors the lifecycle of the request.  It needs to be
// loaded before `.routes()` because it needs to be around after everything
// else. 
// [dispatchActions]  This middleware leverages `redux-batched-actions` to
//  dispatch all the actions stored within `ctx.actions` which get added by
//  other middleware during the lifecycle of the request.
// [loadingMonitor] This middleware will monitor the lifecycle of a request and
//  attach the appropriate loading states to the loader associated with the
//  endpoint.
// [queryCtx] sets up the ctx object with `ctx.request` and `ctx.response`
//  required for `createApi` to function properly.
// [urlParser] is a middleware that will take the name of `api.create(name)` and
//  replace it with the values passed into the action.
// [simpleCache] is a middleware that will automatically store the response of
//  endpoints if the endpoint has `ctx.cache = true`
api.use(requestMonitor());

// This is where all the endpoints (e.g. `.get()`, `.put()`, etc.) you created
// get added to the middleware stack.  It is recommended to put this as close to
// the beginning of the stack so everything after `yield next()`
// happens at the end of the effect.
api.use(api.routes());

// Under the hood this is a middleware that handles fetching
// and endpoint using window.fetch.  It also automatically 
// processes JSON and stores it in `ctx.json`.
api.use(fetcher({ baseUrl: 'https://...' }))

// This is how you create a function that will fetch an API endpoint.  The
// first parameter is the name of the action type.  When using `urlParser` it
// will also be the URL inside `ctx.request.url` of which you can do what you
// want with it.
const fetchUsers = api.get(
  `/users`,
  // Since this middleware is first it has the unique benefit of being in full
  // control of when the other middleware get activated.
  // The type inside of `ApiCtx` is the response object
  function* (ctx: ApiCtx<{ users: User[] }>, next) {
    // anything before this call can mutate the `ctx` object before it gets
    // sent to the other middleware
    yield next();
    // anything after the above line happens *after* the middleware gets called and
    // and a fetch has been made.

    // using ApiCtx `ctx.json` is a discriminated union based on the
    // boolean `ctx.response.ok`.
    if (!ctx.json.ok) return;

    // data = { users: User[] };
    const { data } = ctx.json;
    const curUsers = data.users.reduce<MapEntity<User>>((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});

    // save the data to our redux slice called `users`
    yield put(users.actions.add(curUsers));
  },
);

// This is a helper function that does a bunch of stuff to prepare redux for
// saga-query.  In particular, it will:
//   - Setup redux-saga
//   - Setup redux-batched-actions
//   - Setup a couple of reducers that saga-query will use: loaders and data
const prepared = prepareStore({
  reducers: { users: users.reducer },
  sagas: { api: api.saga() }
});
const store = createStore(
  prepared.reducer,
  undefined,
  applyMiddleware(...prepared.middleware),
);
// This runs the sagas
prepared.run();

store.dispatch(fetchUsers());
```

## Recipes

### Manipulating the request

Under the hood, `ctx.request` goes directly into `fetch`.  `ctx.response` is
the `Response` object from `fetch`.  The `fetcher` middleware assumes you are
dealing with JSON so it will automatically set the `Content-Type` and also try
to convert the `Response` to JSON.

We built a helper function that is baked into the `ctx` object called `ctx.req()`.

The entire purpose of this function is to help make it easier to update the
request object that will be sent directly into `fetch`.  It does a smart merge
with the current `ctx.request` object and whatever you pass into it.

We recommend **not** updating properies on the `ctx.request` object directly and instead
use `ctx.req` to assign the value of `ctx.request`.

```ts
const createUser = api.post<{ id: string, email: string }>(
  `/users`,
  function* onCreateUser(ctx: ApiCtx<User>, next) {
    // here we manipulate the request before it gets sent to our middleware
    ctx.request = ctx.req({
      body: JSON.stringify({ email: ctx.payload.email }),
    });

    yield next();

    if (!ctx.json.ok) return;

    const curUser = ctx.json.data;
    const curUsers = { [curUser.id]: curUser };

    yield put(users.actions.add(curUsers));
  },
);

store.dispatch(createUser({ id: '1', }));
```

Have some `request` data that you want to set when creating the endpoint?

```ts
const fetchUsers = api.get('/users', api.request({ credentials: 'include' }))
```

`api.request()` accepts the request for the `Ctx` that the end-developer
provides.

### Auto caching

If you want to have a cache that doesn't enforce strict types and is more of a
dumb cache that fetches and stores data for you, then `simpleCache` will
provide that functionality for you.

The following code will mimic what a library like `react-query` is doing
behind-the-scenes.  I want to make it clear that `react-query` is doing a lot
more than this so I don't want to understate what it does.  However, you can
see that not only can we get a core chunk of the functionality `react-query`
provides with a little over 100 lines of code but we also have full control
over fetching, querying, and caching data with the ability to customize it
using middleware.

```ts
// api.ts
import {
  createApi,
  requestMonitor,
  fetcher,
  timer,
  prepareStore,
} from 'saga-query';

const api = createApi();
api.use(requestMonitor());
api.use(api.routes());
api.use(fetcher());

// this will only activate the endpoint at most once every 5 minutes.
const cacheTimer = timer(5 * 60 * 1000);
export const fetchUsers = api.get(
  '/users',
  { saga: cacheTimer },
  // set `ctx.cache=true` to have simpleCache middleware cache response data
  // automatically
  api.cache(),
);

const prepared = prepareStore({
  sagas: { api: api.saga() },
});
const store = createStore(
  prepared.reducer,
  undefined,
  applyMiddleware(...prepared.middleware),
);
// This runs the sagas
prepared.run();
```

```tsx
// app.tsx
import React from 'react';
import { useQuery } from 'saga-query/react';

import { fetchUsers } from './api';

interface User {
  id: string;
  name: string;
}

const useUsers = () => {
  const query = useQuery<{ users: User[] }>(fetchUsers);
  useEffect(() => {
    query.trigger();
  }, []);
  return query;
}

export const App = () => {
  const { data = [], isInitialLoading, isError, message } = useUsers();

  if (isInitialLoading) return <div>Loading ...</div>;
  if (isError) return <div>Error: {message}</div>;

  return (
    <div>
      {data.map((user) => <div key={user.id}>{user.name}</div>)}
    </div>
  );
}
```

### Dispatching many actions

Sometimes we need to dispatch a bunch of actions for an endpoint.  From loading
states to making multiple requests in a single saga, there can be a lot of
actions being dispatched.  When using `prepareStore` we automatically setup
`redux-batched-actions` so you don't have to.  Anything that gets added to
`ctx.actions` will be automatically dispatched by the `dispatchActions`
middleware.

### Dependent queries

Sometimes it's necessary to compose multiple endpoints together.  For example
we might want to fetch a mailbox and its associated messages.  Every endpoint
also returns a property on the action creator `.run` which returns the saga
that runs when the action is dispatched.

This allows us to `yield` to that saga inside another endpoint.

```ts
const fetchMailbox = api.get('/mailboxes');

const fetchMessages = api.get<{ id: string }>(
  '/mailboxes/:id/messages',
  function*(ctx, next) {
    // The return value of a `.run` is the entire `ctx` object.
    const mailCtx = yield call(fetchMailbox.run, fetchMailbox());

    if (!mailCtx.json.ok) {
      yield next();
      return;
    }

    ctx.request = ctx.req({
      url: `/mailboxes/${mailCtx.json.id}/messages`
    });

    yield next();
  },
);
```

### Dynamic endpoints

Sometimes a URL needs to be generated from other data.  When creating an
endpoint, it **must** be created **before** `api.saga()` is called.  Because of
this, there's a limitation to what we can permit inside the `name` of the
endpoint.  The `name` is the first parameter passed to the HTTP methods
`api.get(name)` or `api.post(name)`.  If you need to generate the URL based on
dynamic content, like a state derived value, then the recommended solution is
to do the following:

```ts
api.post<{ message: string }>('create-message', function* onCreateMsg(ctx, next) {
  // made up selector that grabs a mailbox
  const mailbox = yield select(selectMailbox);
  const message = ctx.payload.message;

  ctx.request = ctx.req({
    url: `/mailboxes/${mailbox.id}/messages`,
    body: JSON.stringify({ message }),
  });

  yield next();
})
```

As you can see, we can put whatever want for the `name` parameter passed into
`api.get(name)`.  The key thing to realize here is that the name **must** be
unique across all endpoints since the name is what we use for the action type.

### Error handling

Error handling can be accomplished in a bunch of places in the middleware
pipeline.

Catch all middleware before itself:

```ts
const api = createApi();
api.use(function* upstream(ctx, next) {
  try {
    yield next();
  } catch (err) {
    console.log('error!');
  }
});
api.use(api.routes());

api.use(function* fail() {
  throw new Error('some error');
});

const action = api.create(`/error`);
const store = setupStore(api.saga());
store.dispatch(action());
```

Catch middleware inside the action handler:

```ts
const api = createApi();
api.use(api.routes());
api.use(function* fail() {
  throw new Error('some error');
});

const action = api.create(`/error`, function* (ctx, next) {
  try {
    yield next();
  } catch (err) {
    console.log('error!');
  }
});

const store = setupStore(api.saga());
store.dispatch(action());
```

Global error handler:

```ts
const api = createApi({
  onError: (err: Error) => { console.log('error!'); },
});
api.use(api.routes());
api.use(function* upstream(ctx, next) {
  throw new Error('failure');
});

const action = api.create(`/error`);
const store = setupStore(api.saga());
store.dispatch(action());
```

### Loading state

When using `prepareStore` in conjunction with `requestMonitor` the loading state will automatically be
added to all of your endpoints.  We also export `QueryState` which is the
interface that contains all the state types that `saga-query` provides.

```tsx
// app.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { QueryState } from 'saga-query';
import { useLoader } from 'saga-query/react';

interface MapEntity<E> {
  [key: string]: E | undefined;
}

import {
  fetchUsers,
  selectUsersAsList,
} from './api';

interface AppState extends QueryState {
  users: MapEntity<User>;
}

const App = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsersAsList);
  const loader = useLoader(fetchUsers);

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  if (loader.isInitialLoading) return <div>Loading ...</div>
  if (loader.isError) return <div>Error: {loader.message}</div>

  return (
    <div>{users.map((user) => <div key={user.id}>{user.email}</div>)}</div>
  );
}
```

### React

We built a couple of simple hooks `useQuery`, `useCache`, `useLoader`, and
`userLoaderSuccess` to make
interacting with `saga-query` easier.  Having said that, it would be trivial to
build your own custom hooks to do exactly what you want.

This section is a WIP, for now you can [read the
source](https://github.com/redux-saga/saga-query/blob/main/src/react.ts)

### Cache timer

Only call the endpoint at most on an interval.  We can call the endpoint
as many times as we want but it will only get activated once every X
milliseconds.  This effectively updates the cache on an interval.

```ts
import { timer } from 'saga-query';

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;

const fetchUsers = api.get(
  '/users',
  { saga: timer(5 * MINUTES) }
);
```

### Take leading

If two requests are made:
- (A) request; then
- (B) request

While (A) request is still in flight, (B) request would be canceled.

```ts
import { takeLeading } from 'saga-query';

// this is for demonstration purposes, you can import it using
// import { leading } from 'saga-query';
function* leading(action: string, saga: any, ...args: any[]) {
  yield takeLeading(`${action}`, saga, ...args);
}

const fetchUsers = api.get(
  `/users`,
  { saga: leading },
  function* processUsers(ctx, next) {
    yield next();
    // ...
  },
);
```

### Polling

We built this saga helper for you which will either accept the timer as a number
or if the payload contains a timer prop:

```ts
import { poll } from 'saga-query';

const pollUsers = api.get(
  `/users`,
  { saga: poll(5 * 1000) },
);
```

`action.payload.timer` takes precedence.

```tsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { pollUsers } from './api';

const App = () => {
  const dispatch = useDispatch();
  const [polling, setPolling] = useState("init");

  const onClick = () => {
    if (polling === "on") setPolling("off");
    else setPolling("on");
  };

  useEffect(() => {
    if (polling === "init") return;
    dispatch(pollRepo());
  }, [polling]);

  return (
    <div>
      <div>Polling: {polling}</div>
      <button onClick={onClick}>Toggle Polling</button>
    </div>
  );
}
```

### Optimistic UI

Here is the manual, one-off way to handle optimistic ui:

```ts
import { put, select } from 'saga-query';

interface UpdateUser { id: string; email: string };

const updateUser = api.patch<UpdateUser>(
  `/users/:id`,
  function* onUpdateUser(ctx: ApiCtx<User, UpdateUser>, next) {
    // the payload gets typed to UpdateUser
    const { id, email } = ctx.payload;
    ctx.request = ctx.req({
      body: JSON.stringify(email),
    });

    // save the current user record in a variable
    const prevUser = yield select(selectUserById, { id }));
    // optimistically update user
    yield put(users.actions.patch({ [user.id]: { email } }));

    // activate PATCH request
    yield next();

    // oops something went wrong, revert!
    if (!ctx.json.ok) {
      yield put(users.actions.add({ [prevUser.id]: prevUser });
      return;
    }

    // even though we know what was updated, it's still a good habit to
    // update our local cache with what the server sent us
    const nextUser = ctx.json.data;
    yield put(users.actions.add({ [nextUser.id]: nextUser }));
  },
)
```

Not too bad, but we built an optimistic middleware for you:

```tsx
import { OptimisticCtx, optimistic } from 'saga-query';

interface MapEntity<E> {
  [key: string]: E | undefined;
}

interface PatchEntity<T> {
  [key: string]: Partial<T[keyof T]>;
}

const api = createApi();
api.use(api.routes());
api.use(optimistic);

api.patch(
  function* (ctx: OptimisticCtx<PatchEntity<User>, MapEntity<User>>, next) {
    const { id, email } = ctx.payload;
    const prevUser = yield select(selectUserById, { id }));

    ctx.optimistic = {
      apply: users.actions.patch({ [id]: { email } }),
      revert: users.actions.add({ [id]: prevUser }),
    };

    ctx.request = ctx.req({
      method: 'PATCH',
      body: JSON.stringify({ email }),
    });

    yield next();
  }
);
```

### Undo

We build a simple undo middleware that waits for one of two actions to be
dispatched:

- doIt() which will call the endpoint
- undo() which will cancel the endpoint

The middleware accepts three properties:

- `doItType` (default: `${doIt}`) => action type
- `undoType` (default: `${undo}`) => action type
- `timeout` (default: 30 * 1000) => time in milliseconds before the endpoint
  get canceled automatically

```ts
import {
  createApi,
  requestMonitor,
  undoer,
  undo,
  doIt,
  UndoCtx,
  delay,
  put,
  race
} from 'saga-query';

interface Message {
  id: string;
  archived: boolean;
}

const messages = createTable<Message>({ name: 'messages' });
const api = createApi<UndoCtx>();
api.use(requestMonitor());
api.use(api.routes());
api.use(undoer());

const archiveMessage = api.patch<{ id: string; }>(
  `message/:id`,
  function* onArchive(ctx, next) {
    ctx.undoable = true;

    // prepare the request
    ctx.request = ctx.req({
      body: JSON.stringify({ archived: true }),
    });

    // make the API request
    yield next();
  }
)

const reducers = createReducerMap(messages);
const store = setupStore(api.saga(), reducers);

store.dispatch(archiveMessage({ id: '1' }));
// wait 2 seconds to cancel endpoint
store.dispatch(undo());
// -or- to activate the endpoint
store.dispatch(doIt());
```

This is not the **only** way to implement an undo mechanism, it's just the one
we provide out-of-the-box to work with a UI that fully controls the undo
mechanism.

For example, if you want the endpoint to be called automatically after some
timer, you could build a middleware to do that for you:

```ts
import { race, delay } from 'saga-query';

const undo = () => ({ type: 'UNDO' });
function* undoer<Ctx extends UndoCtx = UndoCtx>() {
  if (!ctx.undoable) {
    yield next();
    return;
  }

  const winner = yield race({
    timer: delay(3 * 1000),
    undo: take(`${undo}`),
  });

  if (winner.undo) return;
  yield next();
}
```

# Performance monitor

```ts
import { performanceMonitor, createPipe, wrap, PerfCtx, delay } from 'saga-query';

const thunks = createPipe<PerfCtx>();
thunks.use(function* (ctx, next) {
  yield next();
  console.log(`calling ${ctx.name} took ${ctx.performance} ms`);
});
thunks.use(performanceMonitor);
thunks.use(thunks.routes());

function* slowSaga() {
  yield delay(10 * 1000);
}

const slow = thunks.create('something-slow', wrap(slowSaga));

store.dispatch(slow());
// calling something-slow took 10000 ms
```

## Redux-toolkit

`redux-toolkit` is a very popular redux library officially supported by the
`redux` team.  When using it with `saga-query` the main thing it is responsible
for is setting up the redux slice where we want to cache the API endpoint
response data.

```ts
import { createStore } from 'redux';
import {
  prepareStore,
  createApi,
  requestMonitor,
  fetcher,
} from 'saga-query';
import { createSlice } from '@reduxjs/toolkit';

const users = createSlice({
  name: 'users',
  initialState: {},
  reducers: {
    add: (state, action) => {
      action.payload.forEach((user) => {
        state[user.id] = user.id;
      });
    }
  }
});

const api = createApi();
api.use(requestMonitor());
api.use(api.routes());
api.use(fetcher());

const fetchUsers = api.get<{ users: User[] }>('/users', function* (ctx, next) {
  yield next();
  if (!ctx.json.ok) return;
  const { data } = ctx.json.data;
  yield put(users.actions.add(data.users));
});

const prepared = prepareStore({
  reducers: { users: users.reducer },
  sagas: { api: api.saga() },
});
const store = createStore(
  prepared.reducer,
  {},
  applyMiddleware(...prepared.middleware),
);
prepared.run();

store.dispatch(fetchUsers());
```
