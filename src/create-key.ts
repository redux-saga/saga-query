import { isObject } from './util';

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

function padStart(hash: string, len: number) {
  while (hash.length < len) {
    hash = '0' + hash;
  }
  return hash;
}
//credit to Ivan Perelivskiy: https://gist.github.com/iperelivskiy/4110988
const tinySimpleHash = (s: string) => {
  for (var i = 0, h = 9; i < s.length; )
    h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9);
  return h ^ (h >>> 9);
};

export const createKey = (name: string, payload?: any) => {
  const normJsonString =
    typeof payload !== undefined ? JSON.stringify(deepSortObject(payload)) : '';
  const hash = normJsonString
    ? padStart(tinySimpleHash(normJsonString).toString(16), 8)
    : '';
  return hash ? `${name}|${hash}` : name;
};
