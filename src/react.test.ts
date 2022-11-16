import 'global-jsdom/register';

import { createElement } from 'react';
import test from 'ava';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Provider, useSelector } from 'react-redux';

import { createApi } from './api';
import { requestMonitor } from './middleware';
import { setupStore } from './util';
import { useApi } from './react';
import { delay } from 'redux-saga/effects';
import { selectDataById } from './slice';
import { createAssign } from 'robodux';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

test.afterEach(cleanup);

const h = createElement;

const mockUser = { id: '1', email: 'test@saga-query.com' };

const jsonBlob = (data: any) => {
  return Buffer.from(JSON.stringify(data));
};

const setupTest = () => {
  const slice = createAssign({
    name: 'user',
    initialState: { id: '', email: '' },
  });

  const api = createApi();
  api.use(requestMonitor());
  api.use(api.routes());
  api.use(function* (ctx, next) {
    yield delay(10);
    ctx.json = { ok: true, data: mockUser };
    ctx.response = new Response(jsonBlob(mockUser), { status: 200 });
    yield next();
  });

  const fetchUser = api.get<{ id: string }>('/user/:id', function* (ctx, next) {
    ctx.cache = true;
    yield next();
    if (!ctx.json.ok) return;
    slice.actions.set(ctx.json.data);
  });

  const store = setupStore(api.saga(), { user: slice.reducer });
  return { store, fetchUser, api };
};

test('useApi - with action', async (t) => {
  t.plan(1);
  const { fetchUser, store } = setupTest();
  const App = () => {
    const action = fetchUser({ id: '1' });
    const query = useApi(action);
    const user = useSelector((s: any) =>
      selectDataById(s, { id: action.payload.key }),
    );

    return h('div', null, [
      h('div', { key: '1' }, user?.email || ''),
      h(
        'button',
        { key: '2', onClick: () => query.trigger() },
        query.isLoading ? 'loading' : 'fetch',
      ),
      h('div', { key: '3' }, query.isSuccess ? 'success' : ''),
    ]);
  };
  render(h(Provider, { store, children: h(App) }));

  const button = screen.getByText('fetch');
  fireEvent.click(button);

  await screen.findByText('loading');
  await screen.findByText(mockUser.email);
  await screen.findByText('success');
  t.pass();
});

test('useApi - with action creator', async (t) => {
  t.plan(1);
  const { fetchUser, store } = setupTest();
  const App = () => {
    const query = useApi(fetchUser);
    const user = useSelector((s: any) => s.user);

    return h('div', null, [
      h('div', { key: '1' }, user?.email || ''),
      h(
        'button',
        { key: '2', onClick: () => query.trigger({ id: '1' }) },
        query.isLoading ? 'loading' : 'fetch',
      ),
      h('div', { key: '3' }, query.isSuccess ? 'success' : ''),
    ]);
  };
  render(h(Provider, { store, children: h(App) }));

  const button = screen.getByText('fetch');
  fireEvent.click(button);

  await screen.findByText('loading');
  await screen.findByText(mockUser.email);
  await screen.findByText('success');
  t.pass();
});
