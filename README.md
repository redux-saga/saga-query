# saga-query

Data fetching and caching using redux-saga.  Use our saga middleware system to
quickly build data loading within your redux application. 

## ToC

- [Simple fetch](#show-me-the-way)
- [Manipulating the request](#manipulating-the-request)
- [Error handling](#error-handling)
- [Loading state](#loading-state)
- [Take latest](#take-latest)
- [Polling](#polling)
- [Optimistic UI](#optimistic-ui)

## Features

- A familiar middleware system that node.js developers are familiar with
  (e.g. express, koa)
- Write middleware to handle fetching, synchronizing, and caching API requests
- Unleash the power of redux-saga to handle any async flow control use-cases
- Pre-built middleware to cut out boilerplate for interacting with redux and
  redux-saga
- Simple recipes to handle complex use-cases like cancellation, polling,
  optimistic updates, loading states, undo 

## Why?

Libraries like `react-query`, `rtk-query`, and `apollo-client` are making it
easier than ever to fetch and cache data from an API server.  All of them
have their unique attributes and I encourage everyone to check them out if they
haven't.

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
how to cache API data when a library can do it for you?  However, what happens 
when the queries you're performing against your cache are too slow? What happens 
when `useMemo` isn't good enough?  What happens when you're fighting against a
library that doesn't neatly fit into the status quo?  If you've never needed 
to performance tune selector queries on the front-end, then this library might 
not be for you.  If you just need to make some API requests with loading states
and not much else, then those other libraries are probably a better for you.

This library is intended for large scale, complex flow control applications 
that need full control over the data cache layer while setting good standards
for using redux and a flexible middleware to handle all business logic.

## `saga-query` is *not*

- A DSL wrapped around data fetching and caching logic
- Going to accommodate all use-cases
- Going to erradicate all boilerplate

## A note on `robodux`

The docs heavily use [robodux](https://github.com/neurosnap/robodux) and is 
recommended for usage with `saga-query`.  It will make caching data simple and 
straight-forward.

I also wrote a
[redux-saga style-guide](https://erock.io/2020/01/01/redux-saga-style-guide.html) that
is also heavily encouraged.

## Show me the way

```tsx
// api.ts
import { put, call } from 'redux-saga/effects';
import { createTable, createReducerMap } from 'robodux';
import { 
  createQuery, 
  fetchBody, 
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

const api = createQuery<FetchCtx>();
api.use(fetchBody);
api.use(urlParser);
api.use(function* onFetch(ctx, next) {
  const { url, ...options } = ctx.request;
  const resp = yield call(fetch, url, options);
  const data = yield call([resp, 'json']);

  ctx.response = { status: resp.status, ok: true, data };
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

## Break it down for me

```tsx
import { put, call } from 'redux-saga/effects';
import { createTable, createReducerMap } from 'robodux';
import { 
  createQuery, 
  fetchBody, 
  urlParser, 
  FetchCtx 
} from 'saga-query';

// create a reducer that acts like a SQL database table
// the keys are the id and the value is the record
const users = createTable<User>({ name: 'users' });

// something awesome happens in here
const api = createQuery<FetchCtx>();

// fetchBody sets up the ctx object with `ctx.request` and `ctx.response` used
// specifically for the recommended ctx `FetchCtx`.
api.use(fetchBody);

// urlParser is a middleware that will take the name of `api.create(name)` and
// replace it with the values passed into the action
api.use(urlParser);

// this is where you defined your core fetching logic
api.use(function* onFetch(ctx, next) {
  // ctx.request is the object used to make a fetch request when using
  // `fetchBody` and `urlParser`
  const { url, ...options } = ctx.request;
  const resp = yield call(fetch, url, options);
  const data = yield call([resp, 'json']);

  // with `FetchCtx` we want to set the `ctx.response` so other middleware can
  // use it.
  ctx.response = { status: resp.status, ok: true, data };

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
  // This middleware is special: it gets prepended to the list of middleware.
  // This has the unique benefit of being in full control of when the other
  // middleware get activated.
  // The type inside of `FetchCtx` is the response object
  function* processUsers(ctx: FetchCtx<{ users: User[] }>, next) {
    // anything before this call can mutate the `ctx` object before it gets
    // sent to the other middleware
    yield next();
    // anything after the above line happens *after* the middleware gets called and
    // and a fetch has been made.

    // using FetchCtx 
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
const createUser = query.post<{ email: string }>(
  `/users`,
  function* createUser(ctx: FetchCtx<User>, next) {
    ctx.request = {
      method: 'POST',
      body: JSON.stringify({ email: ctx.payload.options.email }),
    };
    yield next();
    if (!ctx.response.ok) return;

    const curUser = ctx.responspayload.options;
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

```tsx
const createUser = query.post<{ id: string, email: string }>(
  `/users`,
  function* onCreateUser(ctx: FetchCtx<User>, next) {
    // here we manipulate the request before it gets sent to our middleware
    ctx.request = {
      method: 'POST',
      body: JSON.stringify({ email: ctx.payload.options.email }),
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

### Error handling

Error handling can be accomplished in a bunch of places in the middleware
pipeline.

Catch all middleware before itself:

```tsx
const api = createQuery();
api.use(function* upstream(ctx, next) {
  try {
    yield next();
  } catch (err) {
    console.log('error!');
  }
});

api.use(function* fail() {
  throw new Error('some error');
});

const action = api.create(`/error`);
const store = setupStore(api.saga());
store.dispatch(action());
```

Catch middleware inside the action handler:

```tsx
const api = createQuery();
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

```tsx
const api = createQuery({
  onError: (err: Error) => { console.log('error!'); },
});
api.use(function* upstream(ctx, next) {
  throw new Error('failure');
});

const action = api.create(`/error`);
const store = setupStore(api.saga());
store.dispatch(action());
```

### Loading state

```tsx
// api.ts
import { put, call } from 'redux-saga/effects';
import { 
  createTable, 
  createLoaderTable, 
  createReducerMap, 
  defaultLoadingItem,
} from 'robodux';
import { 
  createQuery, 
  fetchBody, 
  urlParser, 
  FetchCtx, 
  createLoadingTracker,
} from 'saga-query';

interface User {
  id: string;
  email: string;
}

export const loaders = createLoaderTable({ name: 'loaders' });
const selectLoaders = (s) => s[loaders.name];
export const selectLoaderById = (s, { id }) => selectLoaders(s)(id) ||
defaultLoadingItem();

export const users = createTable<User>({ name: 'users' });
export const { 
  selectTableAsList: selectUsersAsList 
} = users.getSelectors((s) => s[users.name]);

export const api = createQuery<FetchCtx>();
api.use(fetchBody);
api.use(urlParser);
api.use(createLoadingTracker(loaders));

api.use(function* onFetch(ctx, next) {
  const { url, ...options } = ctx.request;
  const resp = yield call(fetch, url, options);
  const data = yield call([resp, 'json']);

  ctx.response = { status: resp.status, ok: true, data };
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

const reducers = createReducerMap(users, loaders);
const store = setupStore(reducers, api.saga());
```

```tsx
// app.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  loaders, 
  users, 
  fetchUsers, 
  selectUsersAsList, 
  selectLoaderById
} from './api';

const App = () => {
  const users = useSelector(selectUsersAsList);
  const loader = useSelector(
    (s) => selectLoaderById(s, { id: `${fetchUsers}` })
  );

  if (loader.loading) {
    return <div>Loading ...</div>
  }

  if (loader.error) {
    return <div>Error: {loader.error}</div>
  }

  return (
    <div>{users.map((user) => <div key={user.id}>{user.email}</div>)}</div>
  );
}
```

### Take Latest

If two requests are made:
- (A) request; then
- (B) request

While (A) request is still in flight, (B) request would be cancelled.

```tsx
import { takeLatest } from 'redux-saga/effects';

// this is for demonstration purposes, you can import it using
// import { latest } from 'saga-query';
function* latest(action: string, saga: any, ...args: any[]) {
  yield takeLatest(`${action}`, saga, ...args);
}

const fetchUsers = api.get(
  `/users`,
  { saga: latest },
  function* processUsers(ctx, next) {
    yield next();
    // ...
  },
);
```

### Polling

```tsx
import { take, call, delay, race } from 'redux-saga/effects';

function* poll(action: string, saga: any, ...args: any[]) {
  function* fire(timer: number) {
    while (true) {
      yield call(saga, ...args);
      yield delay(timer);
    }
  }

  while (true) {
    const action = yield take(`${action}`);
    yield race([
      call(fire, action.payload.timer),
      take(`${action}`),
    ]);
  }
}

const pollUsers = api.create<{ timer: number }>(
  `/users`,
  { saga: poll },
  function* processUsers(ctx, next) {
    yield next();
    // ...
  }
);
```

```tsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { pollUsers } from './api';

const App = () => {
  const dispatch = useDispatch();
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    dispatch(pollUsers({ timer: 5 * 1000 }));
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

```tsx
import { put, select } from 'redux-saga/effects';

const updateUser = api.patch<Partial<User> & { id: string }>(
  `/users/:id`, 
  function* onUpdateUser(ctx: FetchCtx<User>, next) {
    const { id, email } = ctx.payload.options;
    ctx.request = {
      method: 'PATCH',
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

It would be relatively simple to build an optimistic ui middleware:

```tsx
interface OptimisticCtx extends FetchCtx {
  optimistic: {
    apply: ActionWithPayload<MapEntity<Partial<User>>>,
    revert: ActionWithPayload<MapEntity<User>>,
  }
}

const api = createQuery<OptimisticCtx>();
api.use(function* optimistic(ctx, next) {
  if (!ctx.optimistic) yield next();
  const { apply, revert } = ctx.optimistic;
  // optimistically update user
  yield put(apply);

  yield next();

  if (!ctx.response.ok) {
    yield put(revert);
  }
});

api.patch(function* (ctx, next) {
  const { id, email } = ctx.payload.options;
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
});
```

### Undo

We built a middleware for anyone to use:

```tsx
import { delay, put, race } from 'redux-saga/effects';
import { createAction } from 'robodux';
import { 
  createQuery, 
  fetchBody, 
  urlParser, 
  undoMiddleware, 
  undo,
  UndoCtx,
} from 'saga-query';

interface Message {
  id: string;
  archived: boolean;
}

const messages = createTable<Message>({ name: 'messages' });
const api = createQuery<UndoCtx>();
api.use(fetchBody);
api.use(urlParser);
api.use(undoMiddleware);

const archiveMessage = api.patch<{ id: string; }>(
  `message/:id`,
  function* onArchive(ctx, next) {
    ctx.undo = {
      apply: messages.actions.patch({ 1: { archived: true } }),
      revert: messages.actions.patch({ 1: { archived: false } }),
    };

    // prepare the request
    ctx.request = {
      method: 'PATCH',
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
