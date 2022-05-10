import { createStore, applyMiddleware } from 'redux';
import type { Reducer } from 'redux';
import { prepareStore } from './store';

import { API_ACTION_PREFIX } from './constants';
import { ApiRequest, RequiredApiRequest } from '.';
import { encodeBase64 } from './encoding';
export const isFn = (fn?: any) => fn && typeof fn === 'function';
export const isObject = (obj?: any) => typeof obj === 'object' && obj !== null;
export const createAction = (curType: string) => {
  if (!curType) throw new Error('createAction requires non-empty string');
  const type = `${API_ACTION_PREFIX}/${curType}`;
  const action = () => ({ type });
  action.toString = () => type;
  return action;
};

export function setupStore(
  saga: any,
  reducers: { [key: string]: Reducer } = {},
) {
  const sagas: any = typeof saga === 'function' ? { saga } : saga;
  const prepared = prepareStore({
    reducers,
    sagas,
  });
  const store: any = createStore(
    prepared.reducer,
    applyMiddleware(...prepared.middleware),
  );
  prepared.run();
  return store;
}

export const mergeHeaders = (
  cur?: { [key: string]: string },
  next?: { [key: string]: string },
): HeadersInit => {
  if (!cur && !next) return {};
  if (!cur && next) return next;
  if (cur && !next) return cur;
  return { ...cur, ...next };
};

export const mergeRequest = (
  cur?: ApiRequest | null,
  next?: ApiRequest | null,
): RequiredApiRequest => {
  const defaultReq = { url: '', method: 'GET', headers: mergeHeaders() };
  if (!cur && !next) return { ...defaultReq, headers: mergeHeaders() };
  if (!cur && next) return { ...defaultReq, ...next };
  if (cur && !next) return { ...defaultReq, ...cur };
  return {
    ...defaultReq,
    ...cur,
    ...next,
    headers: mergeHeaders((cur as any).headers, (next as any).headers),
  };
};

export const createActionKey = (name: string, options?: any) => {
  const enc = options ? encodeBase64(JSON.stringify(options)) : '';
  const encKey = enc ? `|${enc}` : '';
  const key = `${name}${encKey}`;
  return key;
};
