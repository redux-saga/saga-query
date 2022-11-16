import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import type { LoadingState } from "robodux";

import type { QueryState } from "./slice";
import { selectLoaderById, selectDataById } from "./slice";

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

export function useLoader<S extends QueryState = QueryState>(
  action: SagaAction | ActionFn
) {
  const id = typeof action === "function" ? `${action}` : action.payload.key;
  return useSelector((s: S) => selectLoaderById(s, { id }));
}

export function useApi<P = any, A extends SagaAction = SagaAction<P>>(
  action: A
): UseApiAction<A>;
export function useApi<P = any, A extends SagaAction = SagaAction<P>>(
  action: ActionFn<P>
): UseApiProps<P>;
export function useApi<A extends SagaAction = SagaAction>(
  action: ActionFnSimple
): UseApiSimpleProps;
export function useApi(action: any) {
  const dispatch = useDispatch();
  const loader = useLoader(action);
  const trigger = (p: any) => {
    if (typeof action === "function") {
      dispatch(action(p));
    } else {
      dispatch(action);
    }
  };
  return { ...loader, trigger, action };
}

export function useQuery<P = any, A extends SagaAction = SagaAction<P>>(
  action: A
): UseApiAction<A> {
  const api = useApi(action);
  useEffect(() => {
    api.trigger();
  }, [action.payload.key]);
  return api;
}

export function useCache<D = any, A extends SagaAction = SagaAction>(
  action: A
): UseCacheResult<D, A> {
  const id = action.payload.key;
  const data = useSelector((s: any) => selectDataById(s, { id }));
  const api = useApi(action);
  return { ...api, data: data || null };
}

export function useLoaderSuccess(
  cur: Pick<LoadingState, "isLoading" | "isSuccess">,
  success: () => any
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
