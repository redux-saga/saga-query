import { isObject } from './util';
import { encodeBase64 } from './encoding';

const deepSortObject = (opts?: any): any => {
  if (!isObject(opts)) return opts;
  return Object.keys(opts)
    .sort()
    .reduce((res: any, key: any) => {
      res[`${key}`] = opts[key];
      if (opts[key] && isObject(opts[key])) {
        res[`${key}`] = deepSortObject(opts[key]);
      }
      return res;
    }, {});
};

export const createKey = (name: string, payload?: any) => {
  const enc =
    typeof payload !== undefined
      ? encodeBase64(JSON.stringify(deepSortObject(payload)))
      : '';
  const encKey = enc ? `|${enc}` : '';
  const key = `${name}${encKey}`;
  return key;
};
