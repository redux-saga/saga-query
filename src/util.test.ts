import test from 'ava';
import { createAction } from './util';
import { API_ACTION_PREFIX } from './constant';

test('createAction - should return action type when stringified', (t) => {
  const undo = createAction('UNDO');
  t.assert(`${API_ACTION_PREFIX}/UNDO` === `${undo}`);
});

test('createAction - return object with type', (t) => {
  const undo = createAction('UNDO');
  t.deepEqual(undo(), { type: `${API_ACTION_PREFIX}/UNDO` });
});
