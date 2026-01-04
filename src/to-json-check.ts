import type { AnySchema, Limit, Schema } from './builder.ts';
import { addExtraCode, evaluate, injectDependency, type Expression } from 'runtime-compiler';

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

export const _compileObject = (schema: AnySchema, input: string): string => {
  let str = '';
  // @ts-ignore
  const required: Record<string, AnySchema> = schema[1];
  for (const key in required) str += '&&' + code(required[key], input + '.' + key);

  // @ts-ignore
  if (schema.length > 2) {
    // @ts-ignore
    const optional: Record<string, AnySchema> | undefined = schema[2];
    for (const key in optional) {
      const keyInput = input + '.' + key;
      str += '&&(typeof ' + keyInput + '==="undefined"||' + code(optional[key], keyInput) + ')';
    }
  }
  return str;
};

export const code = (schema: AnySchema, input: string): Expression<boolean> => {
  // @ts-ignore
  const id: number = schema[0];
  if (id === 0)
    return ('typeof ' + input + '!=="undefined"' + _compileLimits(schema, input, 1)) as any;
  else if (id === 1)
    return ('Number.isFinite(' + input + ')' + _compileLimits(schema, input, 1)) as any;
  else if (id === 2)
    return ('Number.isInteger(' + input + ')' + _compileLimits(schema, input, 1)) as any;
  else if (id === 3) return ('typeof ' + input + '==="boolean"') as any;
  else if (id === 4)
    return ('typeof ' + input + '==="string"' + _compileLimits(schema, input, 1)) as any;
  else if (id === 5)
    return (input +
      '===null&&' +
      // @ts-ignore
      _compile(schema[1], input, scopeDeps)) as any;
  else if (id === 6) {
    // @ts-ignore
    const list: string[] = schema[1];

    input += '===';
    let str = input + JSON.stringify(list[0]);

    input = '&&' + input;
    for (let i = 1; i < list.length; i++) str += input + JSON.stringify(list[i]);
    return str as any;
  } else if (id === 7)
    return ('Array.isArray(' +
      input +
      ')&&' +
      input +
      '.every(' +
      injectDependency(
        'o=>' +
          code(
            // @ts-ignore
            schema[1],
            'o',
          ),
      ) +
      ')' +
      _compileLimits(schema, input, 2)) as any;
  else if (id === 8)
    return ('typeof ' +
      input +
      '==="object"&&' +
      input +
      '!==null' +
      _compileObject(schema, input)) as any;
  else if (id === 9) {
    // @ts-ignore
    const items: AnySchema[] = schema[1];

    let str = 'Array.isArray(' + input + ')&&' + input + '.length===' + items.length;
    for (let i = 0; i < items.length; i++) str += '&&' + code(schema, input + '[' + i + ']');
    return str as any;
  } else if (id === 10) {
    // @ts-ignore
    const prop: string = input + getAccessor(schema[1]) + '===';
    // @ts-ignore
    const map: Record<string, Schema<Record<string, AnySchema>, any>> = schema[2];

    let str = 'typeof ' + input + '==="object"&&' + input + '!==null&&(';
    for (const key in map)
      str += prop + JSON.stringify(key) + '?true' + _compileObject(map[key], input) + ':';
    return (str + 'false)') as any;
  } else if (id === 11)
    return ('d' +
      // @ts-ignore
      schema[1] +
      '(' +
      input +
      ')') as any;
  else if (id === 12) {
    let scope =
      '(()=>{var d=o=>' +
      code(
        // @ts-ignore
        schema[1],
        'o',
      );

    // @ts-ignore
    if (schema.length > 2) {
      // @ts-ignore
      const map: Record<string, AnySchema> | undefined = schema[2];
      for (const key in map) scope += ',d' + key + '=o=>' + code(map[key], 'o');
    }

    return (injectDependency(scope + ';return d})()') + '(' + input + ')') as any;
  }

  throw new Error('Unknown schema base type: ' + id);
};

/**
 * Compile a JSON check function from a schema
 * @param schema
 */
export const compile = <T extends AnySchema>(schema: T): ((o: any) => o is T['~type']) => (
  addExtraCode('return o=>' + code(schema, 'o')), evaluate()
);
