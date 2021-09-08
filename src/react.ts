import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { LoadingState } from 'robodux';
import type { Action } from 'redux';

import type { QueryState } from './slice';
import { selectLoaderById, selectDataById } from './slice';

type Data<D = any> = LoadingState & { data: D | null };

interface QueryProps<D = any, P = any, S = any> {
  actionFn: (p: P) => Action;
  payload: P;
  selector?: (state: S) => D;
}

export function useQuery<D = any, P = any, S = any>({
  actionFn,
  payload,
  selector,
}: QueryProps<D, P, S>): Data<D> {
  const dispatch = useDispatch();
  const id = `${actionFn}`;
  const defaultSelectorFn = (s: S) => selectDataById(s, { id });
  const selectorFn = selector || defaultSelectorFn;
  const loader = useSelector((s: QueryState) => selectLoaderById(s, { id }));
  const data = useSelector(selectorFn);

  useEffect(() => {
    if (!id) return;
    dispatch(actionFn(payload));
  }, [id, payload]);

  return { ...loader, data: data || null };
}
