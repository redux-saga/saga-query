import {
  createStore as createReduxStore,
  applyMiddleware,
  Reducer,
  Middleware,
  combineReducers,
} from 'redux';
import sagaCreator from 'redux-saga-creator';
import createSagaMiddleware, {
  stdChannel,
  Saga,
  Task,
  SagaIterator,
} from 'redux-saga';
import { enableBatching, BATCH } from 'redux-batched-actions';
import { ActionWithPayload } from './types';
import { reducers as sagaQueryReducers, QueryState } from './slice';

export interface PrepareStore<
  S extends { [key: string]: any } = { [key: string]: any },
> {
  reducer: Reducer<S & QueryState>;
  middleware: Middleware<any, S, any>[];
  run: (...args: any[]) => Task;
}

interface Props<S extends { [key: string]: any } = { [key: string]: any }> {
  reducers: { [key in keyof S]: Reducer<S[key]> };
  sagas: { [key: string]: Saga<any> };
  onError?: (err: Error) => void;
}

/**
 * prepareStore will setup redux-batched-actions to work with redux-saga.
 * It will also add some reducers to your redux store for decoupled loaders
 * and a simple data cache.
 *
 * const { middleware, reducer, run } = prepareStore({
 *  reducers: { users: (state, action) => state },
 *  sagas: { api: api.saga() },
 *  onError: (err) => console.error(err),
 * });
 * const store = createStore(reducer, {}, applyMiddleware(...middleware));
 * // you must call `.run(...args: any[])` in order for the sagas to bootup.
 * run();
 */
export function prepareStore<
  S extends { [key: string]: any } = { [key: string]: any },
>({ reducers, sagas, onError = console.error }: Props<S>): PrepareStore<S> {
  const middleware: Middleware<any, S, any>[] = [];

  const channel = stdChannel();
  const rawPut = channel.put;
  channel.put = (action: ActionWithPayload<any>) => {
    if (action.type === BATCH) {
      action.payload.forEach(rawPut);
      return;
    }
    rawPut(action);
  };

  const sagaMiddleware = createSagaMiddleware({ channel } as any);
  middleware.push(sagaMiddleware);

  const reducer = combineReducers({ ...sagaQueryReducers, ...reducers });
  const rootReducer: any = enableBatching(reducer);
  const rootSaga = sagaCreator(sagas, onError);
  const run = (...args: any[]) => sagaMiddleware.run(rootSaga, ...args);

  return { middleware, reducer: rootReducer, run };
}
