import type { LocalDependency } from 'runtime-compiler';
import type { AnySchema, Schema } from './type.ts';
import { _compileLimits } from './to-json-assert.ts';

export const code = (
  schema: Schema<Dict<string | number> & Record<string, boolean>, any>,
  input: string,
  startIndex: number,
  fallback: string,
  props: Record<string, LocalDependency<any>>
): string => {
  // Reassign to end the string
  fallback = '){' + fallback + '}';

  // @ts-ignore
  if (schema[0] !== 8) throw new Error('Only object schema is supported');

  let str = '';
  // @ts-ignore
  const required: Record<string, AnySchema> = schema[1];
  for (const key in required) {
    const propSchema = required[key];

    const propInput = 'l' + startIndex++;
    props[key] = propInput as any;

    // @ts-ignore
    const id = propSchema[0];

    str += 'let ' + propInput + '=' + input;
    if (id === 1) {
      str += '.get(' + JSON.stringify(key) +
        ');if(Number.isFinite(' + propInput + ')' + _compileLimits(propSchema, input, 1) + fallback;
    } else if (id === 2) {
      str += '.get(' + JSON.stringify(key) +
        ');if(Number.isInteger(' + propInput + ')' + _compileLimits(propSchema, input, 1) + fallback;
    } else if (id === 3) {
      str += '.has(' + JSON.stringify(key) + ');';
    } else if (id === 4) {
      str += '.get(' + JSON.stringify(key) +
        ');if(typeof ' + propInput + '==="string"' + _compileLimits(propSchema, input, 1) + fallback;
    } else if (id === 6) {

    } else throw new Error('Unsupported schema type: ' + id);
  }

  // @ts-ignore
  if (schema.length > 2) {
    // @ts-ignore
    const optional: Record<string, AnySchema> | undefined = schema[2];
    for (const key in optional) {

    }
  }
  return str;
};
