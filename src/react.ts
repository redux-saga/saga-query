import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import type { LoadingState } from 'robodux';

import type { QueryState } from './slice';
import { selectLoaderById, selectDataById } from './slice';

export interface UseApiResult<D = any> extends LoadingState {
  data: D | null;
  trigger: () => any;
}
export interface UseApiPayloadResult<D = any, P = any> extends LoadingState {
  data: D | null;
  trigger: (p: P) => any;
}
export interface UseApiOptionalResult<D = any, P = any> extends LoadingState {
  data: D | null;
  trigger: (p?: P) => any;
}

export function useQuery<D = any, S = any, P = any>(
  actionFn: (p: P) => { type: string },
  selector: (s: S) => D,
): UseApiPayloadResult<D>;
export function useQuery<D = any, S = any>(
  actionFn: () => { type: string },
  selector: (s: S) => D,
): UseApiResult<D>;
export function useQuery<D = any, S = any, P = any>(
  actionFn: (p?: P) => { type: string },
  selector: (s: S) => D,
): UseApiOptionalResult<D> {
  const dispatch = useDispatch();
  const data = useSelector(selector);
  const loader = useSelector((s: QueryState) =>
    selectLoaderById(s, { id: `${actionFn}` }),
  );
  const trigger = (p?: P) => {
    dispatch(actionFn(p));
  };

  return { ...loader, trigger, data: data || null };
}

export function useCache<D = any, S = any>(action: {
  payload: { name: string; key: string };
}): UseApiResult<D> {
  const dispatch = useDispatch();
  const data = useSelector((s: S) =>
    selectDataById(s, { id: action.payload.key }),
  );
  const { name } = action.payload;
  const loader = useSelector((s: QueryState) =>
    selectLoaderById(s, { id: name }),
  );
  const trigger = () => {
    dispatch(action);
  };

  return { ...loader, trigger, data: data || null };
}

export function useLoaderSuccess(cur: LoadingState, success: () => any) {
  const [prev, setPrev] = useState(cur);
  useEffect(() => {
    const curSuccess = !cur.isLoading && cur.isSuccess;
    if (prev.isLoading && curSuccess) success();
    setPrev(cur);
  }, [cur.isSuccess, cur.isLoading]);
}

export function useLoader<S extends QueryState = QueryState>(action: {
  toString: () => string;
}) {
  return useSelector((s: S) => selectLoaderById(s, { id: `${action}` }));
}
