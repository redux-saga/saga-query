import { useSelector, useDispatch } from 'react-redux';
import type { LoadingState } from 'robodux';

import type { QueryState } from './slice';
import { selectLoaderById, selectDataById } from './slice';

type Data<D = any> = LoadingState & { data: D | null; trigger: () => any };
type DataPayload<D = any, P = any> = LoadingState & {
  data: D | null;
  trigger: (p: P) => any;
};

export function useQuery<D = any, S = any, P = any>(
  actionFn: (p: P) => { type: string },
  selector: (s: S) => D,
): DataPayload<D>;
export function useQuery<D = any, S = any>(
  actionFn: () => { type: string },
  selector: (s: S) => D,
): Data<D>;
export function useQuery<D = any, S = any, P = any>(
  actionFn: (p?: P) => { type: string },
  selector: (s: S) => D,
): DataPayload<D> {
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

export function useSimpleCache<D = any, S = any>(action: {
  payload: { name: string };
}): Data<D> {
  const dispatch = useDispatch();
  const id = JSON.stringify(action);
  const data = useSelector((s: S) => selectDataById(s, { id }));
  const { name } = action.payload;
  const loader = useSelector((s: QueryState) =>
    selectLoaderById(s, { id: name }),
  );
  const trigger = () => {
    dispatch(action);
  };

  return { ...loader, trigger, data: data || null };
}
