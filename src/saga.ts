import {
  takeLatest,
  takeLeading,
  throttle as throttleHelper,
  debounce as debounceHelper,
} from 'redux-saga/effects';

const MS = 1000;
const SECONDS = 1 * MS;

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
