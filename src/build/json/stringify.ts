import type { TInfer, TLoadedType } from '../../type.js';
import { stringToJSON, optimizeDirectCall } from '../utils.js';

const __compileKey = (prefix: string, k: string) =>
  "'" + prefix + stringToJSON(k) + ":'";

/**
 * @private
 */
export const __compileToFn = (t: TLoadedType, deps: string[]): string =>
  'o=>' + __compile(t, 'o', deps, false);

const __compileDict = (i: string, deps: string[], t: any[]) => {
  let str = '';
  let noRequired = true;

  if (t[1] != null)
    for (const key in t[1]) {
      str +=
        __compileKey(noRequired ? '{' : ',', key) +
        '+' +
        __compile(t[1][key], i + '.' + key, deps, false) +
        '+';
      noRequired = false;
    }

  if (noRequired) {
    // Setup a function for adding optional props
    let scope = 'o=>{let _="",i=true;';
    if (t[2] != null)
      for (const key in t[2]) {
        const prop = i + '.' + key;
        scope +=
          'if(' +
          prop +
          '===void 0){_+=(i?"{":",")+' +
          __compileKey('', key) +
          '+' +
          __compile(t[2][key], i + '.' + key, deps, true) +
          ';i=false}';
      }
    str += 'd' + deps.push(scope + 'return _}') + '(' + i + ')';
  } else if (t[2] != null)
    for (const key in t[2])
      str +=
        __compileKey(noRequired ? '{' : ',', key) +
        '+' +
        __compile(t[2][key], i + '.' + key, deps, true) +
        '+';

  return str + '"}"';
};

/**
 * @private
 */
export const __compile = (
  t: TLoadedType,
  i: string,
  deps: string[],
  optional: boolean,
): string => {
  let id = t[0];
  let str = '';

  // Null type has the last bit set to 1
  const isNil = (id & 1) === 1;
  if (isNil) {
    id -= 1;
    str = '(' + i + (optional ? '==null?' + i + ':' : '===null?null:');
  } else if (optional) str += '(' + i + '===void 0?void 0:';

  const wrapped = isNil || optional;
  if (id === 0 || id === 2 || id === 8) str += '""+' + i;
  else if (id === 4) str += 'JSON.stringify(' + i + ')';
  else if (id === 6) str += '(' + i + '?"true":"false")';
  else if (id === 10) {
    str += '(';
    // @ts-ignore Enum elements
    for (let j = 0, last = t[1].length - 1; j <= last; j++) {
      // @ts-ignore Enum elements
      const el = stringToJSON(t[1][j]);
      str += j === last ? el + ')' : i + '===' + el + '?' + el + ':';
    }
  } else if (id === 12)
    // @ts-ignore Constant
    str += typeof t[1] === 'string' ? stringToJSON(t[1]) : t[1];
  else if (id === 14) {
    // @ts-ignore
    const item = t[1];
    const id = item[0];

    // Joinable types can be optimized out
    str +=
      id === 0 || id === 2 || id === 8 || id === 10
        ? '"["+' + i + '.join()+"]"'
        : 'd' +
          deps.push(
            'o=>{let _="";for(let i=0;i<o.length;i++)_+=(i===0?"[":",")+' +
              __compile(item, 'o[i]', deps, false) +
              ';return _+"]"}',
          ) +
          '(' +
          i +
          ')';
  } else if (id === 16) str += __compileDict(i, deps, t as any);
  else if (id === 18) {
    // @ts-ignore
    for (let j = 0; j < t[1].length; j++)
      str +=
        (j === 0 ? '"["+' : '","+') +
        // @ts-ignore
        __compile(t[1][j], i + '[' + j + ']', deps, false);
    str += '"]"';
  } else if (id === 20) {
    // @ts-ignore Tag
    const tag = i + '.' + t[1];

    for (
      let j = 0,
        // @ts-ignore Map
        pairs: [string, any][] = Object.entries(t[2]),
        last = pairs.length - 1;
      j <= last;
      j++
    ) {
      const res = __compileDict(i, deps, pairs[j][1]);
      str +=
        j === last
          ? res
          : tag + '===' + stringToJSON(pairs[j][0]) + '?' + res + ':';
    }
  } else if (id === 22)
    // @ts-ignore Check for self ref
    str += (t.length === 1 ? 'd' : 'd' + t[1]) + '(' + i + ')';
  else if (id === 24) {
    let scope = '(()=>{var ';
    const scopeDeps: string[] = [];

    // @ts-ignore Scope deps
    if (t[2] != null)
      // @ts-ignore Scope deps
      for (const key in t[2]) {
        scope +=
          // @ts-ignore Scope deps
          'd' + key + '=' + __compileToFn(t[2][key], scopeDeps) + ',';
      }

    // @ts-ignore Scope main type
    const main = optimizeDirectCall(__compileToFn(t[1], scopeDeps));
    for (let i = 0; i < scopeDeps.length; i++)
      scope += 'd' + (i + 1) + '=' + scopeDeps[i] + ',';

    str +=
      'd' + deps.push(scope + 'd=' + main + ';return d})()') + '(' + i + ')';
  }

  return wrapped ? str + ')' : str;
};

/**
 * Get the compiled assertion code of a schema
 * @param t
 */
export const code = (t: TLoadedType): string => {
  const deps: string[] = [];
  const str = 'return ' + optimizeDirectCall(__compileToFn(t, deps));

  if (deps.length > 0) {
    let res = '';
    for (let i = 0; i < deps.length; i++)
      res += (i === 0 ? 'var d' : ',d') + (i + 1) + '=' + deps[i];
    return res + ';' + str;
  }

  return str;
};

/**
 * Get the compiled stringifier of a schema
 * @param t
 */
export const compile = <T extends TLoadedType>(
  t: T,
): ((o: TInfer<T>) => string) =>
  Function(code(t))();
