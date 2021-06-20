import { Reducer } from 'redux';
import {
  createTable,
  createLoaderTable,
  createReducerMap,
  LoadingItemState,
} from 'robodux';

export interface QueryState {
  '@@saga-query/loaders': { [key: string]: LoadingItemState };
  '@@saga-query/data': { [key: string]: any };
}

export const LOADERS_NAME = `@@saga-query/loaders`;
export const loaders = createLoaderTable({ name: LOADERS_NAME });
export const {
  loading: setLoaderStart,
  error: setLoaderError,
  success: setLoaderSuccess,
  resetById: resetLoaderById,
} = loaders.actions;
export const { selectTable: selectLoaders, selectById: selectLoaderById } =
  loaders.getSelectors((state: any) => state[LOADERS_NAME] || {});

export const DATA_NAME = `@@saga-query/data`;
export const data = createTable<any>({ name: DATA_NAME });
export const { selectTable: selectData, selectById: selectDataById } =
  data.getSelectors((s: any) => s[DATA_NAME] || {});
export const { add: addData } = data.actions;

export const reducers = createReducerMap(loaders, data);

export const createQueryState = (s: Partial<QueryState> = {}): QueryState => {
  return {
    [LOADERS_NAME]: {},
    [DATA_NAME]: {},
    ...s,
  };
};
