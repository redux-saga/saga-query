# saga-query

[![ci](https://github.com/neurosnap/saga-query/actions/workflows/test.yml/badge.svg)](https://github.com/neurosnap/saga-query/actions/workflows/test.yml)

Data fetching and caching using redux-saga.  Use our saga middleware system to
quickly build data loading within your redux application.

**This library is undergoing active development. Consider this in a beta
state.**

- [Examples](#examples)
- [Simple fetch](#show-me-the-way)
- [How does it work?](#how-does-it-work?)
- [Manipulating the request](#manipulating-the-request)
- [Simple cache](#simple-cache)
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
- [redux-toolkit](#redux-toolkit)

## Features

- Write middleware to handle fetching, synchronizing, and caching API requests
  on the front-end
- A familiar middleware system that node.js developers are familiar with
  (e.g. express, koa)
- Unleash the power of redux-saga to handle any async flow control use-cases
- Full control over the data fetching and caching layers in your application
- Fine tune queries and caching for your specific needs
- Pre-built middleware to cut out boilerplate for interacting with redux and
  redux-saga
- Simple recipes to handle complex use-cases like cancellation, polling,
  optimistic updates, loading states, undo, react
- Progressively add it to your codebase: all we do is add sagas and action
  creators to your system
- Use it with any other redux libraries

## Why?

Libraries like [react-query](https://react-query.tanstack.com/),
[rtk-query](https://rtk-query-docs.netlify.app/), and
[apollo-client](https://www.apollographql.com/docs/react/) are making it
easier than ever to fetch and cache data from an API server.  All of them
have their unique attributes and I encourage everyone to check them out.

I find that the async flow control of `redux-saga` is one of the most robust
and powerful declaractive side-effect systems I have used.  Treating
side-effects as data makes testing dead simple and provides a powerful effect
handling system to accomodate any use-case.  Features like polling, data
loading states, cancellation, racing, parallelization, optimistic updates,
and undo are at your disposal when using `redux-saga`.  Other
libraries and paradigms can also accomplish the same tasks, but I think nothing
rivals the readability and maintainability of redux/redux-saga.

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

If you've never needed to performance tune selector queries on the
front-end, then this library might not be for you.  If you just need to make
some API requests with loading states and not much else, then those other
libraries are probably a better fit for you.

This library is intended for large scale, complex flow control applications
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
- Going to accommodate all use-cases
- Going to erradicate all boilerplate

### Examples

- [Simple](https://codesandbox.io/s/saga-query-simple-ifcwf)
- [Basic](https://codesandbox.io/s/saga-query-basic-jtceo)
- [Simple cache](https://codesandbox.io/s/saga-query-simple-cache-0ge33)
- [Polling](https://codesandbox.io/s/saga-query-polling-1fwfo)
- [Optimistic update](https://codesandbox.io/s/saga-query-optimistic-xwzz2)

## A note on `robodux`

The docs heavily use [robodux](https://github.com/neurosnap/robodux) and is
recommended for usage with `saga-query`.  **It is not required to use
`saga-query`.**  At this point in time `saga-query` works fine with other
libraries like `redux-toolkit` and I didn't want to impose `robodux` on other
developers.

Having said that, I use it for most of my production applications and it will
make caching data simple and straight-forward.  Even for large scale applications,
100% of my redux state is composed of `robodux` slice helpers.

I also wrote a
[redux-saga style-guide](https://erock.io/2020/01/01/redux-saga-style-guide.html) that
is also heavily encouraged.

## Show me the way

```ts
// api.ts
import { put, call } from 'redux-saga/effects';
import { createTable, createReducerMap } from 'robodux';
import {
  createApi,
  queryCtx,
  urlParser,
  FetchCtx
} from 'saga-query';

interface User {
  id: string;
  email: string;
}

const users = createTable<User>({ name: 'users' });
const selectors = users.getSelectors((s) => s[users.name]);
export const { selectTableAsList: selectUsersAsList } = selectors;

const api = createApi<FetchCtx>();
api.use(api.routes());
api.use(queryCtx);
api.use(urlParser);
api.use(function* onFetch(ctx, next) {
  const { url = '', ...options } = ctx.request;
  const resp = yield call(fetch, url, options);
  const data = yield call([resp, 'json']);

  ctx.response = { status: resp.status, ok: resp.ok, data };
  yield next();
});

const fetchUsers = api.get(
  `/users`,
  function* processUsers(ctx: FetchCtx<{ users: User[] }>, next) {
    yield next();
    if (!ctx.response.ok) return;

    const { data } = ctx.response;
    const curUsers = data.users.reduce<MapEntity<User>>((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});
    yield put(users.actions.add(curUsers));
  },
);

const reducers = createReducerMap(users);
const store = setupStore(reducers, api.saga());
```

```tsx
// app.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, selectUsersAsList } from './api';

const App = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsersAsList);

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  return (
    <div>{users.map((user) => <div key={user.id}>{user.email}</div>)}</div>
  );
}
```

## How does it work?

`createApi` will build a set of actions and sagas for each `create` or http
method used (e.g. `get`, `post`, `put`).  Let's call them endpoints.  Each
endpoint gets their own action and linked saga.  When you call `api.saga()` it
loops through all the endpoints and creates a root saga that is fault tolerant
(one saga won't crash all the other sagas).  The default for each saga is to
use `takeEvery` from `redux-saga` but as you'll see in other recipes, this can
be easily overriden.

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

## Break it down for me

```ts
import { put, call } from 'redux-saga/effects';
import { createTable, createReducerMap } from 'robodux';
import {
  createApi,
  queryCtx,
  urlParser,
  // FetchCtx is an interface that's built around using window.fetch
  // You don't have to use it if you don't want to.
  FetchCtx
} from 'saga-query';

// create a reducer that acts like a SQL database table
// the keys are the id and the value is the record
const users = createTable<User>({ name: 'users' });

// something awesome happens in here
// The default generic value here is `ApiCtx` which includes a `payload`,
// `request`, and `response`.
// The generic passed to `createApi` must extend `ApiCtx` to be accepted.
const api = createApi<FetchCtx>();

// This is where all the endpoints (e.g. `.get()`, `.put()`, etc.) you created
// get added to the middleware stack.  It is recommended to put this as close to
// the beginning of the stack so everything after `yield next()`
// happens at the end of the effect.
api.use(api.routes());

// queryCtx sets up the ctx object with `ctx.request` and `ctx.response`
// required for `createApi` to function properly.
api.use(queryCtx);

// urlParser is a middleware that will take the name of `api.create(name)` and
// replace it with the values passed into the action
api.use(urlParser);

// this is where you defined your core fetching logic
api.use(function* onFetch(ctx, next) {
  // ctx.request is the object used to make a fetch request when using
  // `queryCtx` and `urlParser`
  const { url = '', ...options } = ctx.request;
  const resp = yield call(fetch, url, options);
  const data = yield call([resp, 'json']);

  // with `FetchCtx` we want to set the `ctx.response` so other middleware can
  // use it.
  ctx.response = { status: resp.status, ok: resp.ok, data };

  // we almost *always* need to call `yield next()` that way other middleware will be
  // called downstream of this middleware. The only time we don't call `next`
  // is when we don't want to call any middleware after this one.
  yield next();
});

// This is how you create a function that will fetch an API endpoint.  The
// first parameter is the name of the action type.  When using `urlParser` it
// will also be the URL inside `ctx.request.url` of which you can do what you
// want with it.
const fetchUsers = api.get(
  `/users`,
  // Since this middleware is first it has the unique benefit of being in full
  // control of when the other middleware get activated.
  // The type inside of `FetchCtx` is the response object
  function* processUsers(ctx: FetchCtx<{ users: User[] }>, next) {
    // anything before this call can mutate the `ctx` object before it gets
    // sent to the other middleware
    yield next();
    // anything after the above line happens *after* the middleware gets called and
    // and a fetch has been made.

    // using FetchCtx `ctx.response` is a discriminated union based on the
    // boolean `ctx.response.ok`.
    if (!ctx.response.ok) return;

    // data = { users: User[] };
    const { data } = ctx.response;
    const curUsers = data.users.reduce<MapEntity<User>>((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});

    // save the data to our redux slice called `users`
    yield put(users.actions.add(curUsers));
  },
);

// BONUS: POST request to create a user
const createUser = api.post<{ email: string }>(
  `/users`,
  function* createUser(ctx: FetchCtx<User>, next) {
    // since this middleware is the first one that gets called after the action
    // is dispatched, we can set the `ctx.request` to whatever we want.  The
    // middleware we setup for `createApi` will then use the `ctx` to fill in
    // the other details like `url` and `method`
    ctx.request = {
      body: JSON.stringify({ email: ctx.payload.email }),
    };
    yield next();
    if (!ctx.response.ok) return;

    const curUser = ctx.response.data;
    const curUsers = { [curUser.id]: curUser };

    yield put(users.actions.add(curUsers));
  },
);

const reducers = createReducerMap(users);
// this is a fake function `setupStore`
// pretend that it sets up your redux store and runs the saga middleware
const store = setupStore(reducers, api.saga());

store.dispatch(fetchUsers());
store.dispatch(createUser({ email: 'change.me@saga.com' }));
```

## Recipes

### Manipulating the request

```ts
const createUser = api.post<{ id: string, email: string }>(
  `/users`,
  function* onCreateUser(ctx: FetchCtx<User>, next) {
    // here we manipulate the request before it gets sent to our middleware
    ctx.request = {
      body: JSON.stringify({ email: ctx.payload.email }),
    };
    yield next();
    if (!ctx.response.ok) return;

    const curUser = ctx.response.data;
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

### Simple cache

If you want to have a cache that doesn't enforce strict types and is more of a
dumb cache that fetches and stores data for you, you could build a redux slice
that can do that and then a simple react hook to provide the correct types for
each endpoint.

The following code will mimick what a library like `react-query` is doing
behind-the-scenes.  I want to make it clear that `react-query` is doing a lot
more than this so I don't want to understate its usefuless.  However, you can 
see that not only can we get a core chunk of the functionality `react-query`
provides with a little over 100 lines of code but we also have full control 
over fetching, querying, and caching data with the ability to customize it
using middleware.  This provides the end-developer with the tools to customize
their experience without submitting PRs to add configuration options to an
upstream library.

```ts
// api.ts
import { put } from 'redux-saga/effects';
import { 
  createLoaderTable, 
  createTable, 
  createReducerMap,
  LoadingItemState,
} from 'robodux';
import { 
  FetchApiOpts,
  createApi,
  urlParser,
  queryCtx,
  loadingTracker,
  timer,
} from 'saga-query';

export interface AppState {
  data: MapEntity<any>;
  loaders: { [key: string]: LoadingItemState };
}

const name = 'data';
const data = createTable<any>({ name });
export const { selectById: selectDataById } = data.getSelectors((s) => s[name]);

const LOADING_NAME = 'loaders';
const loaders = createLoaderTable({ name: LOADING_NAME });
const { selectById: selectLoaderById } = data.getSelectors(
  (s) => s[LOADING_NAME]
);
export const selectLoader = (id: string) => (state: AppState) =>
  selectLoaderById(state, { id });

export const reducers = createReducerMap(data, loaders);

const api = createApi();
api.use(loadingTracker(loaders));
api.use(api.routes());
api.use(queryCtx);
api.use(urlParser);
// this middleware will automatically save data for you keyed by the action.
api.use(function* (ctx, next) {
  yield next();
  if (!ctx.response.ok) return;
  const key = JSON.stringify(ctx.action);
  yield put(data.actions.add({ [key]: ctx.response.data }));
});
// made up api fetch
api.use(apiFetch);

// this will only activate the endpoint at most once every 5 minutes.
const cacheTimer = timer(5 * 60 * 1000);
export const fetchUsers = api.get('/users', { saga: cacheTimer });
```

```tsx
// use-query.ts
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LoadingState } from 'robodux';

import { AppState, selectLoader, selectDataById } from './api';

type Data<D = any> = LoadingState & { data: D };

export function useQuery<D = any>(
  action: {
    payload: { name: string };
  },
): Data<D> {
  const { name } = action.payload;
  const id = JSON.stringify(action);
  const dispatch = useDispatch();
  const loader = useSelector(selectLoader(name));
  const data = useSelector((s: AppState) => selectDataById(s, { id }));

  useEffect(() => {
    if (!name) return;
    dispatch(action);
  }, [id, name]);

  return { ...loader, data };
}
```

```tsx
// app.tsx
import React from 'react';

import { fetchUsers } from './api';
import { useQuery } from './use-query';

interface User {
  id: string;
  name: string;
}

const useUsers = () => {
  const { data: users = [], ...loader } = useQuery<{ users: User[] }>(
    fetchUsers()
  );
  return { users, ...loader };
}

export const App = () => {
  const { users, isLoading, isError, message } = useUsers();

  if (isLoading) return <div>Loading ...</div>;
  if (isError) return <div>Error: {message}</div>;

  return (
    <div>
      {users.map((user) => <div key={user.id}>{user.name}</div>)}
    </div>
  );
}
```

### Dispatching many actions

Sometimes we need to dispatch a bunch of actions for an endpoint.  From loading
states to making multiple requests in a single saga, there can be a lot of
actions being dispatched.  My recommendation is:

- Use a library like `redux-batched-actions` to dispatch many actions at once
  and only have the reducers hit once.
- Leverage `ctx.actions` (which is a required property to use `createApi`) in
  your middleware.
- Build a middleware that will use `redux-batched-actions` with `ctx.actions`
  and put it at the beginning of the middleware stack.

```ts
// api.ts
import { batchActions } from 'redux-batched-actions';
import { createApi, urlParser, queryCtx } from 'saga-query';

export const api = createApi();
// we want to put this at the beginning of the middleware stack so all
// middleware is done once `yield next()` gets called.
api.use(function* (ctx, next) {
  // activate all middleware after this middleware in the stack
  yield next();
  if (ctx.actions.length === 0) return;
  yield put(batchActions(ctx.actions));
});

// this creates `ctx.actions` for us
api.use(queryCtx);
api.use(urlParser);

// example loader
api.use(function* loader(ctx, next) {
  yield put(setLoaderStart());
  yield next();

  if (!ctx.response.ok) {
    ctx.actions.push(setLoaderError({ message: ctx.response.data.message }));
    return;
  }

  ctx.actions.push(setLoaderSucces());
});

api.use(function* onFetch(ctx, next) {
  const { url = '', options } = ctx.request;
  const resp = yield call(fetch, url, options);
  const data = yield call([resp, 'json']);

  ctx.response = { status: resp.status, ok: resp.ok, data };
  yield next();
});

api.get<{ id: string }>('/user/:id', function* (ctx, next) {
  yield next();
  const { id } = ctx.payload;
  if (!ctx.response.ok) {
    yield next();
    return;
  }

  ctx.actions.push(addUsers({ [id]: ctx.repsonse.data }));
  yield next();
});
```

```ts
// store.ts
import {
  createStore,
  applyMiddleware,
  Middleware,
  Store,
  Reducer,
  AnyAction,
} from 'redux';
import createSagaMiddleware, { Saga, stdChannel } from 'redux-saga';
import { enableBatching, BATCH } from 'redux-batched-actions';

interface AppState {}

interface Props {
  initState?: Partial<AppState>;
  rootReducer: Reducer<AppState, AnyAction>;
  rootSaga: Saga<any>;
}

interface AppStore<State> {
  store: Store<State>;
}

export function setupStore({
  initState,
  rootReducer,
  rootSaga,
}: Props): AppStore<AppState> {
  const middleware: Middleware[] = [];

  // this is important for redux-batched-actions to work with redux-saga
  const channel = stdChannel();
  const rawPut = channel.put;
  channel.put = (action: { type: string, payload: any }) => {
    if (action.type === BATCH) {
      action.payload.forEach(rawPut);
      return;
    }
    rawPut(action);
  };

  const sagaMiddleware = createSagaMiddleware({ channel } as any);
  middleware.push(sagaMiddleware);

  const store = createStore(
    enableBatching(rootReducer),
    initState as AppState,
    applyMiddleware(...middleware),
  );

  sagaMiddleware.run(rootSaga);

  return { store };
}
```

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

    if (!mailCtx.response.ok) {
      yield next();
      return;
    }

    ctx.request = {
      url: `/mailboxes/${mailCtx.response.id}/messages`
    };

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

  ctx.request = {
    url: `/mailboxes/${mailbox.id}/messages`,
    // NOTE: at this point in time, when `ctx.request.url` is present before
    // `urlParser` is activated, then we cannot automatically set the `method`
    // property, you **must** add it youself.
    method: 'POST',
    body: JSON.stringify({ message }),
  };

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

```ts
// api.ts
import { put, call } from 'redux-saga/effects';
import {
  createTable,
  createLoaderTable,
  createReducerMap,
} from 'robodux';
import {
  createApi,
  FetchCtx,
  queryCtx,
  urlParser,
  loadingTracker,
  leading,
} from 'saga-query';

interface User {
  id: string;
  email: string;
}

export const loaders = createLoaderTable({ name: 'loaders' });
export const {
  selectById: selectLoaderById
} = loaders.getSelectors((s) => s[loaders.name]);

export const users = createTable<User>({ name: 'users' });
export const {
  selectTableAsList: selectUsersAsList
} = users.getSelectors((s) => s[users.name]);

export const api = createApi<FetchCtx>();
// This is one case where we want the middleware to be before the router
// middleware.  Since with `robodux` loaders are decoupled from the data that
// it is tracking we can get into weird race conditions where the success or
// error action for the loader gets saved before the data gets saved.  So here
// we ensure that all the other middleware get called before setting the
// loading state to success or failure.
api.use(loadingTracker(loaders));
api.use(api.routes());
api.use(queryCtx);
api.use(urlParser);

api.use(function* onFetch(ctx, next) {
  const { url = '', ...options } = ctx.request;
  const resp = yield call(fetch, url, options);
  const data = yield call([resp, 'json']);

  ctx.response = { status: resp.status, ok: true, data };
  yield next();
});

const fetchUsers = api.get(
  `/users`,
  { saga: leading },
  function* processUsers(ctx: FetchCtx<{ users: User[] }>, next) {
    yield next();
    if (!ctx.response.ok) return;

    const { data } = ctx.response;
    const curUsers = data.users.reduce<MapEntity<User>>((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});

    yield put(users.actions.add(curUsers));
  },
);

const reducers = createReducerMap(users, loaders);
const store = setupStore(reducers, api.saga());
```

```tsx
// app.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  loaders,
  users,
  fetchUsers,
  selectUsersAsList,
  selectLoaderById
} from './api';

const App = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsersAsList);
  const loader = useSelector(
    (s) => selectLoaderById(s, { id: `${fetchUsers}` })
  );
  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  if (loader.isLoading) {
    return <div>Loading ...</div>
  }

  if (loader.isError) {
    return <div>Error: {loader.message}</div>
  }

  return (
    <div>{users.map((user) => <div key={user.id}>{user.email}</div>)}</div>
  );
}
```

### React

Creating a hook that "hooks" into your redux state and how you handle loaders
should be fairly straight-forward.

We could build an API that does this automatically for you but it would quickly
turn into a DSL with a bunch of configuration objects (e.g. fetch immediately
or lazy load?) which is less than ideal.

Furthermore, if you are calling `window.fetch` directly in your react component
instead of building a hook that calls fetch for libraries like `react-query`
then you're asking for pain in the future when you need to refactor that API
call.

Instead, we strive to make it as easy as possible build your own purpose-built
hooks that give you full control over how it functions.  More code, but more
control.

Let's rewrite the react code used in the previous example ([loading
state](#loading-state))

```ts
// use-query.ts
import { useEffect } from 'react';
import { Action } from 'redux';
import { useSelector, useDispatch } from 'react-redux';

import {
  fetchUsers,
  selectLoaderById,
  selectUsersAsList,
} from './api';
import { AppState } from './types';

export const useQuery = <Ctx, R = any>(
  action: { payload: { name: string } },
  selector: (state: AppState) => R
): LoadingItemState & { data: R } => {
  const dispatch = useDispatch();
  const props = { id: action.payload.name };
  const loader = useSelector(
    (state: AppState) => selectLoaderById(state, props)
  );
  const data = useSelector(selector);

  // since we are using `takeLeading` if this action gets dispatched multiple
  // times it will cancel all actions before the first one dispatched
  useEffect(() => {
    dispatch(action);
  }, []);

  return { ...loader, data };
}

export const useQueryUsers = () => useQuery(fetchUsers(), selectUsersAsList);
```

```tsx
// app.tsx
import React from 'react';
import { useQueryUsers } from './use-query';

const App = () => {
  const { data, isLoading, isError, message } = useQueryUsers();

  if (isLoading) {
    return <div>Loading ...</div>
  }

  if (isError) {
    return <div>Error: {message}</div>
  }

  return (
    <div>{data.map((user) => <div key={user.id}>{user.email}</div>)}</div>
  );
}
```

### Cache timer

Only call the endpoint at most on an interval.  We can call the endpoint
as many times as we want but it will only get activated once every X
miliseconds.  This effectively updates the cache on an interval.

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

While (A) request is still in flight, (B) request would be cancelled.

```ts
import { takeLeading } from 'redux-saga/effects';

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

const pollUsers = api.create(
  `/users`,
  { saga: poll(5 * 1000) },
  function* processUsers(ctx, next) {
    yield next();
    // ...
  }
);
```

`action.payload.timer` takes precedence.

```tsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { pollUsers } from './api';

const App = () => {
  const dispatch = useDispatch();
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    dispatch(pollUsers());
  }, [polling]);

  return (
    <div>
      <div>Polling: {polling ? 'on' : 'off'}</div>
      <button onClick={() => setPolling(!polling)}>Toggle Polling</button>
    </div>
  );
}
```

### Optimistic UI

Here is the manual, one-off way to handle optimistic ui:

```ts
import { put, select } from 'redux-saga/effects';

const updateUser = api.patch<Partial<User> & { id: string }>(
  `/users/:id`,
  function* onUpdateUser(ctx: FetchCtx<User>, next) {
    const { id, email } = ctx.payload;
    ctx.request = {
      body: JSON.stringify(email),
    };

    // save the current user record in a variable
    const prevUser = yield select(selectUserById, { id }));
    // optimistically update user
    yield put(users.actions.patch({ [user.id]: { email } }));

    // activate PATCH request
    yield next();

    // oops something went wrong, revert!
    if (!ctx.response.ok) {
      yield put(users.actions.add({ [prevUser.id]: prevUser });
      return;
    }

    // even though we know what was updated, it's still a good habit to
    // update our local cache with what the server sent us
    const nextUser = ctx.response.data;
    yield put(users.actions.add({ [nextUser.id]: nextUser }));
  },
)
```

Not too bad, but we built an optimistic middleware for you:

```tsx
import { MapEntity, PatchEntity } from 'robodux';
import { OptimisticCtx, optimistic } from 'saga-query';

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

    ctx.request = {
      method: 'PATCH',
      body: JSON.stringify({ email }),
    };

    yield next();
  }
);
```

### Undo

We built a middleware for anyone to use:

```ts
import { delay, put, race } from 'redux-saga/effects';
import { createAction } from 'robodux';
import {
  createApi,
  queryCtx,
  urlParser,
  undoer,
  undo,
  UndoCtx,
} from 'saga-query';

interface Message {
  id: string;
  archived: boolean;
}

const messages = createTable<Message>({ name: 'messages' });
const api = createApi();
api.use(api.routes());
api.use(queryCtx);
api.use(urlParser);
api.use(undoer);

const archiveMessage = api.patch<{ id: string; }>(
  `message/:id`,
  function* onArchive(ctx: UndoCtx<PatchEntity<Message>, PatchEntity<Message>>, next) {
    ctx.undo = {
      apply: messages.actions.patch({ 1: { archived: true } }),
      revert: messages.actions.patch({ 1: { archived: false } }),
    };

    // prepare the request
    ctx.request = {
      body: JSON.stringify({ archived: true }),
    };

    // make the API request
    yield next();
  }
)

const reducers = createReducerMap(messages);
const store = setupStore(api.saga(), reducers);

store.dispatch(archiveMessage({ id: '1' }));
// wait 2 seconds
store.dispatch(undo());
```

### Redux-toolkit

`redux-toolkit` is a very popular redux library officially supported by the
`redux` team.  When using it with `saga-query` the main thing it is responsible
for is setting up the redux slice where we want to cache the API endpoint
response data.

```ts
import { createSlice } from 'redux-toolkit';

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
api.use(api.routes());
api.use(queryCtx);
api.use(urlParser);
// made up window.fetch logic
api.use(apiFetch);

const fetchUsers = api.get<{ users: User[] }>('/users', function* (ctx, next) {
  yield next();
  const { data } = response.data;
  yield put(users.actions.add(data.users));
});

const reducers = createReducerMap(users);
const store = setupStore(api.saga(), reducers);

store.dispatch(fetchUsers());
```
