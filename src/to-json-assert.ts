import type { AnySchema, Limit, Schema } from './type.ts';

export const _compileLimits = (schema: AnySchema, input: string, startIndex: number): string => {
  let str = '';

  // @ts-ignore
  while (startIndex < schema.length) {
    str += '&&';

    // @ts-ignore
    const limit: Limit = schema[startIndex++];
    const id: number = limit[0];

    if (id === 1) str += input + '.length<' + (limit[1] + 1);
    else if (id === 2) str += input + '.length>' + (limit[1] - 1);
    else if (id === 3) str += input + '.startsWith(' + JSON.stringify(limit[1]) + ')';
    else if (id === 4) str += input + '<=' + limit[1];
    else if (id === 5) str += input + '>=' + limit[1];
    else if (id === 6) str += input + '<' + limit[1];
    else if (id === 7) str += input + '>' + limit[1];
    else throw new Error('Unknown limit type: ' + id);
  }

  return str;
};

export const _compileObject = (schema: AnySchema, input: string, deps: string[]): string => {
  let str = '';
  // @ts-ignore
  const required: Record<string, AnySchema> = schema[1];
  for (const key in required) str += '&&' + _compile(required[key], input + '.' + key, deps);

  // @ts-ignore
  const optional: Record<string, AnySchema> | undefined = schema[2];
  if (optional != null)
    for (const key in optional) {
      const keyInput = input + '.' + key;
      str += '&&(typeof ' + keyInput + '==="undefined"||' + _compile(optional[key], keyInput, deps) + ')';
    }
  return str;
};

export const _compileToFn = (schema: AnySchema, deps: string[]): string =>
  'o=>' + _compile(schema, 'o', deps);

export const _compile = (schema: AnySchema, input: string, deps: string[]): string => {
  // @ts-ignore
  const id: number = schema[0];
  if (id === 0) return 'typeof ' + input + '!=="undefined"' + _compileLimits(schema, input, 1);
  else if (id === 1) return 'Number.isFinite(' + input + ')' + _compileLimits(schema, input, 1);
  else if (id === 2) return 'Number.isInteger(' + input + ')' + _compileLimits(schema, input, 1);
  else if (id === 3) return 'typeof ' + input + '==="boolean"';
  else if (id === 4) return 'typeof ' + input + '==="string"' + _compileLimits(schema, input, 1);
  else if (id === 5)
    return (
      input +
      '===null&&' +
      // @ts-ignore
      _compile(schema[1], input, scopeDeps)
    );
  else if (id === 6) {
    // @ts-ignore
    const list: string[] = schema[1];

    input += '===';
    let str = input + JSON.stringify(list[0]);

    input = '&&' + input;
    for (let i = 1; i < list.length; i++) str += input + JSON.stringify(list[i]);
    return str;
  } else if (id === 7)
    return (
      'Array.isArray(' +
      input +
      ')&&' +
      input +
      '.every(d' +
      deps.push(
        _compileToFn(
          // @ts-ignore
          schema[1],
          deps,
        ),
      ) +
      ')' +
      _compileLimits(schema, input, 2)
    );
  else if (id === 8)
    return (
      'typeof ' + input + '==="object"&&' + input + '!==null' + _compileObject(schema, input, deps)
    );
  else if (id === 9) {
    // @ts-ignore
    const items: AnySchema[] = schema[1];

    let str = 'Array.isArray(' + input + ')&&' + input + '.length===' + items.length;
    for (let i = 0; i < items.length; i++)
      str += '&&' + _compile(schema, input + '[' + i + ']', deps);
    return str;
  } else if (id === 10) {
    // @ts-ignore
    const prop: string = input + '.' + schema[1] + '===';
    // @ts-ignore
    const map: Record<string, Schema<Record<string, AnySchema>, any>> = schema[2];

    let str = 'typeof ' + input + '==="object"&&' + input + '!==null&&(';
    for (const key in map)
      str += prop + JSON.stringify(key) + '?true' + _compileObject(map[key], input, deps) + ':';
    return str + 'false)';
  } else if (id === 11)
    return (
      'd' +
      // @ts-ignore
      schema[1] +
      '(' +
      input +
      ')'
    );
  else if (id === 12) {
    const scopeDeps: string[] = [];
    let scope =
      '(()=>{var d=' +
      _compileToFn(
        // @ts-ignore
        schema[1],
        scopeDeps,
      );

    // @ts-ignore
    const map: Record<string, AnySchema> | undefined = schema[2];
    if (map != null)
      for (const key in map) scope += ',d' + key + '=' + _compileToFn(map[key], scopeDeps);

    for (let i = 0; i < scopeDeps.length; i++) scope += ',d' + (i + 1) + '=' + scopeDeps[i];

    return 'd' + deps.push(scope + ';return d})()') + '(' + input + ')';
  } else if (id === 13)
    return _compile(
      // @ts-ignore
      schema[1],
      input,
      deps,
    );

  throw new Error('Unknown schema base type: ' + id);
};

/**
 * Get the compiled JSON assertion code of a schema
 * @param schema
 */
export const code = (schema: AnySchema): string => {
  const deps: string[] = [];
  const str = _compileToFn(schema, deps);

  if (deps.length === 0) return 'return ' + str;

  let res = 'var d1=' + deps[0];
  for (let i = 1; i < deps.length; i++) res += ',d' + (i + 1) + '=' + deps[i];
  return res + ';return ' + str;
};

/**
 * Get the compiled JSON assertion function of a schema
 * @param schema
 */
export const compile = <T extends AnySchema>(schema: T): ((o: any) => o is T['~type']) =>
  Function(code(schema))();
