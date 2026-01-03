import { addExtraCode, evaluate, type LocalValue } from 'runtime-compiler';

import type { AnySchema, Schema } from './type.ts';

import { getObjectProperty } from './utils.ts';
import { _compileLimits } from './to-json-assert.ts';

export type HeadersSchema = Schema<Dict<boolean | string>, any>;
export type HeadersParser<T extends HeadersSchema> = (headers: Headers) => {
  [K in keyof T['~type']]-?: undefined extends T['~type'][K] ? null | (T['~type'][K] & {}) : T['~type'][K]
} | null;

export const code = <T extends HeadersSchema>(
  schema: T,
): LocalValue<HeadersParser<T>> => {
  // @ts-ignore
  if (schema[0] !== 8) throw new Error('Only object schema is supported');

  let str = 'o=>{let _';
  let props = '';
  let condition = 'true';
  let nextId = 0;
  // @ts-ignore
  const required: Record<string, AnySchema> = schema[1];
  for (const key in required) {
    const propSchema = required[key];

    let input = 'l' + nextId++;
    props += getObjectProperty(key) + ':' + input + ',';

    // @ts-ignore
    const id = propSchema[0];

    str += ',' + input;
    if (id === 3) {
      str += '=o.has(' + JSON.stringify(key) + ')';
    } else {
      str += '=o.get(' + JSON.stringify(key) + ')';

      if (id === 4) {
        condition +=
          '&&' + input + '!==null' + _compileLimits(propSchema, input, 1);
      } else if (id === 6) {
        // @ts-ignore
        const list: string[] = propSchema[1];

        // o!==
        input += '===';
        condition += '&&(' + input + JSON.stringify(list[0]);

        // ||o===
        input = '||' + input;
        for (let i = 1; i < list.length; i++) condition += input + JSON.stringify(list[i]);

        condition += ')';
      } else throw new Error('Unsupported schema type for required properties: ' + id);
    }
  }

  // @ts-ignore
  if (schema.length > 2) {
    // @ts-ignore
    const optional: Record<string, AnySchema> | undefined = schema[2];
    for (const key in optional) {
      const propSchema = optional[key];

      let input = 'l' + nextId++;
      props += getObjectProperty(key) + ':' + input + ',';

      // @ts-ignore
      const id = propSchema[0];

      str += ',' + input;
      if (id === 3) {
        str += '=o.has(' + JSON.stringify(key) + ')';
      } else {
        str += '=o.get(' + JSON.stringify(key) + ')';

        if (id === 6) {
          condition += '&&(' + input + '===null';

          // &&o!==
          input = '||' + input + '===';
          for (
            let i = 0,
              // @ts-ignore
              list: string[] = propSchema[1];
            i < list.length;
            i++
          )
            condition += input + JSON.stringify(list[i]);

          condition += ')';
        } else if (id !== 4) throw new Error('Unsupported schema type for required properties: ' + id);
      }
    }
  }

  return (str + ';return ' + condition + '?{' + props + '}:null}') as any;
};

export const compile = <T extends HeadersSchema>(
  schema: T,
): HeadersParser<T> => (
  addExtraCode('return ' + code(schema)), evaluate()
);
