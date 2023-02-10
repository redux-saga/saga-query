import test from 'ava';
import type { ActionWithPayload } from './types';
import { createApi } from './api';
import { poll } from './saga';

const getKeyOf = (action: ActionWithPayload<any>): string => action.payload.key;

test('options object keys order for action key identity - 0: empty options', (t) => {
  t.plan(1);
  const api = createApi();
  api.use(api.routes());
  // no param
  const action0 = api.get(
    '/users',
    { saga: poll(5 * 1000) }, // with poll middleware
    function* (ctx, next) {
      ctx.request = {
        method: 'GET',
      };
      yield next();
    },
  );
  const sendNop0 = action0();
  const sendNop1 = action0();
  t.assert(getKeyOf(sendNop0) === getKeyOf(sendNop1));
});

test('options object keys order for action key identity - 1: simple object', (t) => {
  t.plan(4);
  const api = createApi();
  api.use(api.routes());
  // no param
  const action0 = api.get<{
    [key: string]: string | boolean | number | null | undefined;
  }>(
    '/users',
    { saga: poll(5 * 1000) }, // with poll middleware
    function* (ctx, next) {
      ctx.request = {
        method: 'GET',
      };
      yield next();
    },
  );
  const sendPojo0 = action0({
    a: 'a',
    b: 'b',
    c: 1,
    d: 2,
    e: true,
    f: false,
    '100': 100,
    101: '101',
  });
  const sendPojo1 = action0({
    a: 'a',
    b: 'b',
    c: 1,
    d: 2,
    e: true,
    f: false,
    100: 100,
    101: '101',
  });
  const sendPojo2 = action0({
    e: true,
    f: false,
    '100': 100,
    '101': '101',
    a: 'a',
    b: 'b',
    c: 1,
    d: 2,
  });
  const sendPojo3 = action0({
    e: true,
    f: false,
    '100': 100,
    '101': '101',
    a: 'a',
    b: 'b',
    c: 1,
    d: 2000000,
  });
  const sendPojo4 = action0({
    e: null,
    f: false,
    '100': undefined,
    '101': '101',
    a: 'a',
    b: 'b',
    c: 1,
    d: `Thomas O'Malley`,
  });
  const sendPojo5 = action0({
    d: `Thomas O'Malley`,
    e: null,
    f: false,
    '100': undefined,
    '101': '101',
    a: 'a',
    b: 'b',
    c: 1,
  });
  t.assert(getKeyOf(sendPojo0) === getKeyOf(sendPojo1));
  t.assert(getKeyOf(sendPojo0) === getKeyOf(sendPojo2));
  t.assert(getKeyOf(sendPojo0) !== getKeyOf(sendPojo3));
  t.assert(getKeyOf(sendPojo4) === getKeyOf(sendPojo5));
});

test('options object keys order for action key identity - 2: object (with array values)', (t) => {
  interface Ip0 {
    param1: string;
    param2: string[];
  }
  t.plan(2);
  const api = createApi();
  api.use(api.routes());
  const action = api.get<Ip0>('/users/:param1/:param2', function* (ctx, next) {
    ctx.request = {
      method: 'GET',
    };
    yield next();
  });
  const sendFirst = action({ param1: '1', param2: ['2', 'e', 'f'] });
  const sendSecond = action({ param2: ['2', 'f', 'e'], param1: '1' });
  const sendThird = action({ param2: ['2', 'e', 'f'], param1: '1' });
  t.assert(getKeyOf(sendFirst) !== getKeyOf(sendSecond)); // array is different
  t.assert(getKeyOf(sendFirst) === getKeyOf(sendThird)); // object has same keys same values
});

test('options object keys order for action key identity - 3: nested object', (t) => {
  interface Ip0 {
    param1: string;
    param2: string[];
  }
  interface Ip1 {
    param1: string;
    param2: string;
    param3: number;
    param4: Ip0;
    param5: boolean;
  }
  const o1: Ip1 = {
    param1: '1',
    param2: '2',
    param3: 3,
    param4: {
      param1: '4',
      param2: ['5', '6'],
    },
    param5: true,
  };
  const o2: Ip1 = {
    param4: {
      param1: '4',
      param2: ['5', '6'],
    },
    param5: true,
    param2: '2',
    param1: '1',
    param3: 3,
  };
  t.plan(2);
  const api = createApi();
  api.use(api.routes());
  //nested with array
  const action2 = api.get<Ip1>(
    '/users/:param1/:param2/:param3/:param4/:param5',
    function* (ctx, next) {
      ctx.request = {
        method: 'GET',
      };
      yield next();
    },
  );
  const sendO1 = action2(o1);
  const sendO2 = action2(o2);
  const sendO3 = action2({
    ...o1,
    param4: { ...o1.param4, param2: ['5', '6', '7'] },
  });
  t.assert(getKeyOf(sendO1) === getKeyOf(sendO2));
  t.assert(getKeyOf(sendO1) !== getKeyOf(sendO3));
});

test('options object keys order for action key identity - 4: deepNested object', (t) => {
  interface Ip0 {
    param1: string;
    param2: string[];
  }
  interface Ip1 {
    param1: string;
    param2: string;
    param3: number;
    param4: Ip0;
    param5: boolean;
  }
  interface Ip3 {
    param1: string;
    param2: {
      param3: Ip1;
      param4: Ip0;
    };
  }
  const o1: Ip1 = {
    param1: '1',
    param2: '2',
    param3: 3,
    param4: {
      param1: '4',
      param2: ['5', '6'],
    },
    param5: true,
  };
  const o2: Ip1 = {
    param4: {
      param1: '4',
      param2: ['5', '6'],
    },
    param5: true,
    param1: '1',
    param2: '2',
    param3: 3,
  };
  const oo1: Ip3 = {
    param1: '1',
    param2: {
      param3: o1,
      param4: {
        param1: '4',
        param2: ['5', '6'],
      },
    },
  };
  const oo2: Ip3 = {
    param1: '1',
    param2: {
      param4: {
        param1: '4',
        param2: ['5', '6'],
      },
      param3: o1,
    },
  };
  t.plan(4);
  const api = createApi();
  api.use(api.routes());
  // deepNested
  const action4 = api.get<Ip3>(
    '/users/:param1/:param2/:param3/:param4/:param5',
    function* (ctx, next) {
      ctx.request = {
        method: 'GET',
      };
      yield next();
    },
  );
  const send_oo1 = action4(oo1);
  const send_oo1_shuff = action4({ param2: oo1.param2, param1: oo1.param1 });
  const send_oo1_value_changed = action4({ ...oo1, param1: 'x' });
  const send_oo2 = action4(oo2);
  t.deepEqual(send_oo1.payload.options, send_oo2.payload.options);
  t.assert(getKeyOf(send_oo1) === getKeyOf(send_oo1_shuff));
  t.assert(getKeyOf(send_oo1) !== getKeyOf(send_oo1_value_changed));
  t.assert(getKeyOf(send_oo1) === getKeyOf(send_oo2)); // deep nested shuffled //
});

test('options object keys order for action key identity - 5: other', (t) => {
  t.plan(17);
  const api = createApi();
  api.use(api.routes());
  //array options
  const action5 = api.post<
    number | boolean | string | undefined | null | any[]
  >('/users/:allRecords', function* (ctx, next) {
    ctx.request = {
      method: 'POST',
      body: JSON.stringify(ctx.action.payload),
    };
    yield next();
  });
  const falsy0 = action5(0);
  const falsy1 = action5(false);
  const falsy2 = action5('');
  const falsy3 = action5(undefined);
  const falsy4 = action5(null);
  const primNo0 = action5(NaN);
  const primNo1 = action5(1);
  const primNo1bis = action5(1);
  const primNo2 = action5(2);
  const str1 = action5('1234');
  const str1bis = action5('1234');
  const str2 = action5('2345');
  const aStrings1 = action5(['1', '2', '3']);
  const aStrings2 = action5(['1', '2', '3']);
  const aStrings3 = action5(['1', '2', '1']);
  const aObjects1 = action5([
    { param1: '1', param2: ['2', '3'] },
    { param1: '2', param2: ['2', '3'] },
  ]);
  const aObjects2 = action5([
    { param1: '1', param2: ['2', '3'] },
    { param1: '2', param2: ['2', '3'] },
  ]);
  // the objects are not identical.
  const aObjects3 = action5([
    { param1: '1', param2: ['2', '3'] },
    { param1: '2', param2: ['2', 3] },
  ]);
  //object inside the array is shuffled
  const aObjects4 = action5([
    { param2: ['2', '3'], param1: '1' },
    { param2: ['2', '3'], param1: '2' },
  ]);
  // cont the order of array elements is changed will get different keys.
  const aObjects5 = action5([
    { param1: '2', param2: ['2', '3'] },
    { param1: '1', param2: ['2', '3'] },
  ]);
  t.assert(getKeyOf(falsy0) !== getKeyOf(falsy1));
  t.assert(getKeyOf(falsy0) !== getKeyOf(falsy2));
  t.assert(getKeyOf(falsy1) !== getKeyOf(falsy2));
  t.assert(getKeyOf(falsy1) !== getKeyOf(falsy3));
  t.assert(getKeyOf(falsy3) !== getKeyOf(falsy4));
  t.assert(getKeyOf(primNo0) !== getKeyOf(falsy0));
  t.assert(getKeyOf(primNo0) !== getKeyOf(primNo1));
  t.assert(getKeyOf(primNo1) !== getKeyOf(primNo2));
  t.assert(getKeyOf(primNo1) === getKeyOf(primNo1bis));
  t.assert(getKeyOf(str1) !== getKeyOf(str2));
  t.assert(getKeyOf(str1) === getKeyOf(str1bis));
  t.assert(getKeyOf(aStrings1) === getKeyOf(aStrings2));
  t.assert(getKeyOf(aStrings1) !== getKeyOf(aStrings3));
  t.assert(getKeyOf(aObjects1) === getKeyOf(aObjects2));
  t.assert(getKeyOf(aObjects1) !== getKeyOf(aObjects3));
  t.assert(getKeyOf(aObjects1) === getKeyOf(aObjects4));
  t.assert(getKeyOf(aObjects1) !== getKeyOf(aObjects5));
});
