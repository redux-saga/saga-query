import { SagaIterator, Task } from 'redux-saga';
import {
  takeLatest,
  takeLeading,
  throttle as throttleHelper,
  debounce as debounceHelper,
  call,
  delay,
  race,
  take,
  fork,
} from 'redux-saga/effects';
import { ActionWithPayload } from 'robodux';
import { CreateActionPayload } from './types';

const MS = 1000;
const SECONDS = 1 * MS;
const MINUTES = 60 * SECONDS;

export function* latest(action: string, saga: any, ...args: any[]) {
  yield takeLatest(`${action}`, saga, ...args);
}

export function* leading(action: string, saga: any, ...args: any[]) {
  yield takeLeading(`${action}`, saga, ...args);
}

export function createThrottle(ms: number = 5 * SECONDS) {
  return function* (action: string, saga: any, ...args: any[]) {
    yield throttleHelper(ms, `${action}`, saga, ...args);
  };
}

export function createDebounce(ms: number = 5 * SECONDS) {
  return function* (action: string, saga: any, ...args: any[]) {
    yield debounceHelper(ms, `${action}`, saga, ...args);
  };
}

export interface PollProps {
  timer?: number;
}

/**
 * poll() will create a poll endpoint that will continuously query the endpoint
 * on an interval of your choice.
 *
 * poll() will also look for `timer` and `force` inside action.payload:
 *
 * @example
 * ```ts
 * import { PollProps, createAction } from 'saga-query';
 *
 * const myAction = createAction<{ id: string } & PollProps>('MY-ACTION');
 * store.dispatch(myAction({ id: '123', timer: 1000 }));
 * ```
 */
export function poll(parentTimer?: number, cancelType?: string) {
  return function* poller(
    actionType: string,
    saga: any,
    ...args: any[]
  ): SagaIterator<void> {
    const cancel = cancelType || actionType;
    function* fire(action: { type: string }, timer: number) {
      while (true) {
        yield call(saga, action, ...args);
        yield delay(timer);
      }
    }

    while (true) {
      const action = yield take(`${actionType}`);
      const timer = action.payload?.timer || parentTimer;
      yield race([call(fire, action, timer), take(`${cancel}`)]);
    }
  };
}

export interface TimerProps {
  timer?: number;
  force?: boolean;
}

/**
 * timer() will create a cache timer for each `key` inside
 * of a saga-query api endpoint.  `key` is a hash of the action type and payload.
 *
 *
 * Why do we want this?  If we have an api endpoint to fetch a single app: `fetchApp({ id: 1 })`
 * if we don't set a timer per key then all calls to `fetchApp` will be on a timer.
 * So if we call `fetchApp({ id: 1 })` and then `fetchApp({ id: 2 })` if we use a normal
 * cache timer then the second call will not send an http request.
 *
 * timer() will also look for `timer` and `force` inside action.payload:
 *
 * @example
 * ```ts
 * import { TimerProps, createAction } from 'saga-query';
 *
 * const myAction = createAction<{ id: string } & TimerProps>('MY-ACTION');
 * store.dispatch(myAction({ id: '123', force: true, timer: 1000 }));
 * ```
 */
export function timer(sagaTimer: number = 5 * MINUTES) {
  return function* onTimer(
    actionType: string,
    saga: any,
    ...args: any[]
  ): SagaIterator<void> {
    const map: { [key: string]: Task } = {};

    function* activate(
      action: ActionWithPayload<CreateActionPayload & TimerProps>,
    ) {
      yield call(saga, action, ...args);
      const { timer: actionTimer = 0 } = action.payload;
      yield delay(actionTimer >= 0 ? actionTimer : sagaTimer);
      delete map[action.payload.key];
    }

    while (true) {
      const action: ActionWithPayload<CreateActionPayload & TimerProps> =
        yield take(`${actionType}`);
      const { key, force } = action.payload;
      const notRunning = map[key] && !map[key].isRunning();
      if (force || !map[key] || notRunning) {
        const task = yield fork(activate, action);
        map[key] = task;
      }
    }
  };
}
