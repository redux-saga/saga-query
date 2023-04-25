import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import type { LoadingState } from 'robodux';

import type { QueryState } from './slice';
import { selectLoaderById, selectDataById } from './slice';
import { Action } from './types';

type ActionFn<P = any> = (p: P) => { toString: () => string };
type ActionFnSimple = () => { toString: () => string };

interface SagaAction<P = any> {
  type: string;
  payload: { key: string; options: P };
}

export interface UseApiProps<P = any> extends LoadingState {
  trigger: (p: P) => void;
  action: ActionFn<P>;
}
export interface UseApiSimpleProps extends LoadingState {
  trigger: () => void;
  action: ActionFn;
}
export interface UseApiAction<A extends SagaAction = SagaAction>
  extends LoadingState {
  trigger: () => void;
  action: A;
}
export type UseApiResult<P, A extends SagaAction = SagaAction> =
  | UseApiProps<P>
  | UseApiSimpleProps
  | UseApiAction<A>;

interface UseCacheResult<D = any, A extends SagaAction = SagaAction>
  extends UseApiAction<A> {
  data: D | null;
}

/**
 * useLoader will take an action creator or action itself and return the associated
 * loader for it.
 *
 * @returns the loader object for an action creator or action
 *
 * @example
 * ```tsx
 * import { useLoader } from 'saga-query/react';
 *
 * import { api } from './api';
 *
 * const fetchUsers = api.get('/users', function*() {
 *   // ...
 * });
 *
 * const View = () => {
 *   const loader = useLoader(fetchUsers);
 *   // or: const loader = useLoader(fetchUsers());
 *   return <div>{loader.isLoader ? 'Loading ...' : 'Done!'}</div>
 * }
 * ```
 */
export function useLoader<S extends QueryState = QueryState>(
  action: SagaAction | ActionFn,
) {
  const id = typeof action === 'function' ? `${action}` : action.payload.key;
  return useSelector((s: S) => selectLoaderById(s, { id }));
}

/**
 * useApi will take an action creator or action itself and fetch
 * the associated loader and create a `trigger` function that you can call
 * later in your react component.
 *
 * This hook will *not* fetch the data for you because it does not know how to fetch
 * data from your redux state.
 *
 * @example
 * ```tsx
 * import { useApi } from 'saga-query/react';
 *
 * import { api } from './api';
 *
 * const fetchUsers = api.get('/users', function*() {
 *   // ...
 * });
 *
 * const View = () => {
 *   const { isLoading, trigger } = useApi(fetchUsers);
 *   useEffect(() => {
 *     trigger();
 *   }, []);
 *   return <div>{isLoading ? : 'Loading' : 'Done!'}</div>
 * }
 * ```
 */
export function useApi<P = any, A extends SagaAction = SagaAction<P>>(
  action: A,
): UseApiAction<A>;
export function useApi<P = any, A extends SagaAction = SagaAction<P>>(
  action: ActionFn<P>,
): UseApiProps<P>;
export function useApi<A extends SagaAction = SagaAction>(
  action: ActionFnSimple,
): UseApiSimpleProps;
export function useApi(action: any) {
  const dispatch = useDispatch();
  const loader = useLoader(action);
  const trigger = (p: any) => {
    if (typeof action === 'function') {
      dispatch(action(p));
    } else {
      dispatch(action);
    }
  };
  return { ...loader, trigger, action };
}

/**
 * useQuery uses {@link useApi} and automatically calls `useApi().trigger()`
 *
 * @example
 * ```tsx
 * import { useQuery } from 'saga-query/react';
 *
 * import { api } from './api';
 *
 * const fetchUsers = api.get('/users', function*() {
 *   // ...
 * });
 *
 * const View = () => {
 *   const { isLoading } = useQuery(fetchUsers);
 *   return <div>{isLoading ? : 'Loading' : 'Done!'}</div>
 * }
 * ```
 */
export function useQuery<P = any, A extends SagaAction = SagaAction<P>>(
  action: A,
): UseApiAction<A> {
  const api = useApi(action);
  useEffect(() => {
    api.trigger();
  }, [action.payload.key]);
  return api;
}

/**
 * useCache uses {@link useQuery} and automatically selects the cached data associated
 * with the action creator or action provided.
 *
 * @example
 * ```tsx
 * import { useCache } from 'saga-query/react';
 *
 * import { api } from './api';
 *
 * const fetchUsers = api.get('/users', api.cache());
 *
 * const View = () => {
 *   const { isLoading, data } = useCache(fetchUsers());
 *   return <div>{isLoading ? : 'Loading' : data.length}</div>
 * }
 * ```
 */
export function useCache<D = any, A extends SagaAction = SagaAction>(
  action: A,
): UseCacheResult<D, A> {
  const id = action.payload.key;
  const data = useSelector((s: any) => selectDataById(s, { id }));
  const query = useQuery(action);
  return { ...query, data: data || null };
}

/**
 * useLoaderSuccess will activate the callback provided when the loader transitions
 * from some state to success.
 *
 * @example
 * ```tsx
 * import { useLoaderSuccess, useApi } from 'saga-query/react';
 *
 * import { api } from './api';
 *
 * const createUser = api.post('/users', function*(ctx, next) {
 *   // ...
 * });
 *
 * const View = () => {
 *  const { loader, trigger } = useApi(createUser);
 *  const onSubmit = () => {
 *    trigger({ name: 'bob' });
 *  };
 *
 *  useLoaderSuccess(loader, () => {
 *    // success!
 *    // Use this callback to navigate to another view
 *  });
 *
 *  return <button onClick={onSubmit}>Create user!</button>
 * }
 * ```
 */
export function useLoaderSuccess(
  cur: Pick<LoadingState, 'isLoading' | 'isSuccess'>,
  success: () => any,
) {
  const [prev, setPrev] = useState(cur);
  useEffect(() => {
    const curSuccess = !cur.isLoading && cur.isSuccess;
    if (prev.isLoading && curSuccess) {
      success();
    }
    setPrev(cur);
  }, [cur.isSuccess, cur.isLoading]);
}

/**
 * usePoller will properly setup and teardown a poller endpoint.
 *
 * @example
 * ```ts
 * import { poll, createPipe, PollProps } from 'saga-query';
 * import { usePoller } from 'saga-query/react';
 * import { createAction } from '@reduxjs/toolkit';
 *
 * const thunks = createPipe();
 * thunks.use(thunks.routes());
 *
 * const cancelAppsPoll = createAction("cancel-apps-poll");
 * const pollApps = thunks.create<PollProps>(
 *  "poll-apps",
 *  { saga: poll(5 * 1000, `${cancelAppsPoll}`) },
 *  fetchApps,
 * );
 *
 * const App = () => {
 *  const data = usePoller(pollApps(), cancelAppsPoll());
 * }
 * ```
 */
export function usePoller<P = any, A extends SagaAction = SagaAction<P>>(
  pollAction: A,
  cancelAction: Action = pollAction,
) {
  const dispatch = useDispatch();
  const apps = useQuery(pollAction);
  useEffect(() => {
    const cancel = () => dispatch(cancelAction);
    cancel();
    apps.trigger();
    return () => {
      cancel();
    };
  }, []);

  return apps;
}
