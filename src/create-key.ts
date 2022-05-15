import { isObject } from './util';

export const koSort = (opts?: any): object => {
  if (opts === null || opts === undefined) return {};
  if (!isObject(opts)) return { opts: opts };
  return Object.keys(opts)
    .sort()
    .reduce((res: any, key: any) => {
      res[`${key}`] = opts[key];
      if (opts[key] && isObject(opts[key])) {
        res[`${key}`] = koSort(opts[key]);
      }
      return res;
    }, {});
};
