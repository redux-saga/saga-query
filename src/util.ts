import { Reducer, combineReducers, createStore, applyMiddleware } from 'redux';
import { prepareStore } from './store';

import { API_ACTION_PREFIX } from './constants';
export const isFn = (fn?: any) => fn && typeof fn === 'function';
export const isObject = (obj?: any) => typeof obj === 'object' && obj !== null;
export const createAction = (curType: string) => {
  if (!curType) throw new Error('createAction requires non-empty string');
  const type = `${API_ACTION_PREFIX}/${curType}`;
  const action = () => ({ type });
  action.toString = () => type;
  return action;
};

export function setupStore<S = any>(
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
