import type { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';

import type { Middleware, PipeCtx } from './types';

export function compose<Ctx extends PipeCtx = PipeCtx>(
  middleware: Middleware<Ctx>[],
) {
  if (!Array.isArray(middleware)) {
    throw new TypeError('Middleware stack must be an array!');
  }
  for (const fn of middleware) {
    if (typeof fn !== 'function') {
      throw new TypeError('Middleware must be composed of functions!');
    }
  }

  return function* composeSaga(
    context: Ctx,
    next?: Middleware,
  ): SagaIterator<void> {
    // last called middleware #
    let index = -1;
    yield call(dispatch, 0);

    function* dispatch(i: number): SagaIterator<void> {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;
      let fn: any = middleware[i];
      if (i === middleware.length) {
        fn = next;
      }
      if (!fn) {
        return;
      }
      yield call(fn, context, dispatch.bind(null, i + 1));
    }
  };
}
