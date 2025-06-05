import type { TInfer, TLoadedType } from '../../type.js';
import { optimizeDirectCall } from '../utils.js';

/**
 * @private
 */
export const __compileLimits = (
  arr: TLoadedType,
  start: number,
  i: string,
): string => {
  let str = '';

  // @ts-ignore
  while (start < arr.length) {
    // @ts-ignore
    const limit = arr[start++];

    const id = limit[0];
    str +=
      '&&' +
      (id === 0
        ? i + '>=' + limit[1]
        : id === 1
          ? i + '<=' + limit[1]
          : id === 2
            ? i + '.length>' + (limit[1] - 1)
            : id === 3
              ? i + '.length<' + (limit[1] + 1)
              : id === 4
                ? i + '.length===' + limit[1]
                : 'true');
  }

  return str;
};

/**
 * @private
 */
export const __compileToFn = (t: TLoadedType, deps: string[]): string => 'o=>' + __compile(t, 'o', deps, false);

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

  const isNil = (id & 1) === 1;

  // Null type has the last bit set to 1
  if (isNil) {
    id -= 1;
    str = '(' + i + (optional ? '==null||' : '===null||');
  } else if (optional) str += '(' + i + '===void 0||';

  const wrapped = isNil || optional;
  if (id === 0) str += 'Number.isInteger(' + i + ')' + __compileLimits(t, 1, i);
  else if (id === 2)
    str += 'typeof ' + i + '==="number"' + __compileLimits(t, 1, i);
  else if (id === 4)
    str += 'typeof ' + i + '==="string"' + __compileLimits(t, 1, i);
  else if (id === 6) str += 'typeof ' + i + '==="boolean"';
  else if (id === 8) str += i + '!==void 0';
  else if (id === 10) {
    // @ts-ignore
    const list: string[] = t[1];

    // Safely wrap ||
    if (!wrapped) str += '(';

    str += i + '===' + JSON.stringify(list[0]);
    for (let j = 1; j < list.length; j++)
      str += '||' + i + '===' + JSON.stringify(list[j]);

    if (!wrapped) str += ')';
  } else if (id === 12)
    // @ts-ignore Only stringify when necessary
    str += i + '===' + (typeof t[1] === 'string' ? JSON.stringify(t[1]) : t[1]);
  else if (id === 14)
    str +=
      'Array.isArray(' +
      i +
      ')' +
      __compileLimits(t, 2, i) +
      '&&' +
      i +
      '.every(d' +
      // @ts-ignore Compile item
      deps.push(optimizeDirectCall(__compileToFn(t[1], deps))) +
      ')';
  else if (id === 16) {
    str += (isNil ? '' : i + '!==null&&') + 'typeof ' + i + '==="object"';

    // @ts-ignore Required
    if (t[1] != null)
      // @ts-ignore Required
      for (const key in t[1]) {
        // @ts-ignore Required
        str += '&&' + __compile(t[1][key], i + '.' + key, deps, false);
      }

    // @ts-ignore Optional
    if (t[2] != null)
      // @ts-ignore Optional
      for (const key in t[2]) {
        // @ts-ignore Optional
        str += '&&' + __compile(t[2][key], i + '.' + key, deps, true);
      }
  } else if (id === 18) {
    // @ts-ignore
    const list: any[] = t[1];
    str += 'Array.isArray(' + i + ')&&' + i + '.length===' + list.length;

    for (let j = 0; j < list.length; j++)
      str += '&&' + __compile(list[j], i + '[' + j + ']', deps, false);
  } else if (id === 20) {
    str += (isNil ? '' : i + '!==null&&') + 'typeof ' + i + '==="object"&&(';
    // @ts-ignore Tag
    const tag = i + '.' + t[1];

    // @ts-ignore Map
    for (const key in t[2]) {
      // @ts-ignore Map
      str += tag + '===' + JSON.stringify(key) + '?';

      let first = true;
      // @ts-ignore Required
      for (const key in t[1]) {
        if (first) {
          first = false;
          str += '&&';
        }
        // @ts-ignore Required
        str += __compile(t[1][key], i + '.' + key, deps, false);
      }

      // @ts-ignore Optional
      if (t[2] != null)
        // @ts-ignore Optional
        for (const key in t[2]) {
          if (first) {
            first = false;
            str += '&&';
          }
          // @ts-ignore Optional
          str += __compile(t[2][key], i + '.' + key, deps, true);
        }

      str += ':';
    }

    str += 'false)';
  } else if (id === 22)
    // @ts-ignore Check for self ref
    str += (t.length === 1 ? 'd' : 'd' + t[1]) + '(' + i + ')';
  else if (id === 24) {
    let scope = '(()=>{var ';
    {
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
      scope += 'd=' + main;
    }
    str += 'd' + deps.push(scope + ';return d})()') + '(' + i + ')';
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
 * Get the compiled assertion function of a schema
 * @param t
 */
export const compile = <T extends TLoadedType>(
  t: T,
): ((o: any) => o is TInfer<T>) => Function(code(t))();
