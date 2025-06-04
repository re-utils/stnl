import type { TInfer, TLoadedType } from '../../type.js';

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
  if (id === 0)
    str +=
      'Number.isInteger(' +
      i +
      ')' +
      // @ts-ignore Min
      (t[1] == null ? '' : '&&' + i + '>=' + t[1]) +
      // @ts-ignore Max
      (t[1] == null ? '' : '&&' + i + '<=' + t[2]);
  else if (id === 2)
    str +=
      'typeof ' +
      i +
      '==="number"' +
      // @ts-ignore Min
      (t[1] == null ? '' : '&&' + i + '>=' + t[1]) +
      // @ts-ignore Max
      (t[1] == null ? '' : '&&' + i + '<=' + t[2]);
  else if (id === 4) {
    str +=
      'typeof ' +
      i +
      '==="string"' +
      // @ts-ignore Min
      (t[1] == null ? '' : '&&' + i + '.length>=' + t[1]) +
      // @ts-ignore Max
      (t[1] == null ? '' : '&&' + i + '.length<=' + t[2]);
  } else if (id === 6) str += 'typeof ' + i + '==="boolean"';
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
      // @ts-ignore Min
      (t[2] == null ? '' : '&&' + i + '.length>=' + t[2]) +
      // @ts-ignore Max
      (t[3] == null ? '' : '&&' + i + '.length<=' + t[3]) +
      '&&' +
      i +
      '.every(d' +
      // @ts-ignore Compile item
      deps.push('o=>' + __compile(t[1], 'o', deps, false)) +
      ')';
  else if (id === 16) {
    str += (isNil ? '' : i + '!==null&&') + 'typeof ' + i + '==="object"';

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
    str += (t.length === 1 ? 'f' : 'f' + t[1]) + '(' + i + ')';
  else if (id === 24) {
    let scope = '(()=>{var f';

    {
      const scopeDeps: string[] = [];

      // @ts-ignore Scope deps
      if (t[2] != null)
        // @ts-ignore Scope deps
        for (const key in t[2]) {
          scope +=
            // @ts-ignore Scope deps
            key + '=o=>' + __compile(t[2][key], 'o', scopeDeps, false) + ',f';
        }

      // @ts-ignore Scope main type
      scope += '=o=>' + __compile(t[1], 'o', scopeDeps, false);

      // Load scope dependencies
      for (let i = 0; i < scopeDeps.length; i++)
        scope += ',d' + (i + 1) + '=' + scopeDeps[i];
    }

    str += 'd' + deps.push(scope + ';return f})()') + '(' + i + ')';
  }

  return wrapped ? str + ')' : str;
};

/**
 * Get the compiled assertion code of a schema
 * @param t
 */
export const code = (t: TLoadedType): string => {
  const deps: string[] = [];
  const str = __compile(t, 'o', deps, false);

  let res = '';
  for (let i = 0; i < deps.length; i++)
    res += (i === 0 ? 'var d' : ',d') + (i + 1) + '=' + deps[i];

  return res + ';return o=>' + str;
};

/**
 * Get the compiled assertion function of a schema
 * @param t
 */
export const compile = <T extends TLoadedType>(
  t: T,
): ((o: any) => o is TInfer<T>) => Function(code(t))();
