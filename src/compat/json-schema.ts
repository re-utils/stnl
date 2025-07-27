import { l } from '../../lib/index.js';
import type { TLoadedType } from '../type.js';

export const null_t = { type: 'null' } as const;

const __create_const = (v: any) => ({ const: v });

const __loadLimits = (
  o: Record<string, any>,
  schema: TLoadedType,
  idx: number,
) => {
  if (schema.length > idx)
    do {
      // @ts-ignore
      const limit = schema[idx++];
      const id = limit[0];

      if (id === 0) o.minimum = limit[1];
      else if (id === 1) o.maximum = limit[1];
      else if (id === 2) o.minLength = limit[1];
      else if (id === 3) o.maxLength = limit[1];
      else if (id === 4) o.minLength = o.maxLength = limit[1];
    } while (idx < schema.length);
  return o;
};

const __parse = (id: number, t: TLoadedType) => {
  if (id === 0) return __loadLimits({ type: 'integer' }, t, 1);
  if (id === 2) return __loadLimits({ type: 'number' }, t, 1);
  if (id === 4) return __loadLimits({ type: 'string' }, t, 1);
  if (id === 6) return { type: 'boolean' };

  if (id === 10)
    // @ts-ignore
    return { anyOf: t[1].map(__create_const) };

  if (id === 12)
    // @ts-ignore
    return __create_const(t[1]);

  if (id === 14)
    return __loadLimits(
      {
        type: 'array',
        // @ts-ignore
        items: f(t[1]),
      },
      t,
      2,
    );

  if (id === 16) {
    const props: Record<string, any> = {};

    // @ts-ignore
    const requiredProps = t[1];
    for (const key in requiredProps) props[key] = f(requiredProps[key]);

    // @ts-ignore
    const optionalProps = t[2];
    if (optionalProps != null)
      for (const key in optionalProps) props[key] = f(optionalProps[key]);

    return {
      type: 'object',
      properties: props,
      required: Object.keys(requiredProps),
    };
  }

  if (id === 18)
    return {
      type: 'array',
      // @ts-ignore
      prefixItems: t[1].map(f),
      items: false,
    };

  if (id === 20) {
    const schemas: any[] = [];

    // @ts-ignore
    const tag = t[1];
    // @ts-ignore
    const map = t[2];

    for (const value in map) {
      const type = map[value];

      // Set tag value
      const props: Record<string, any> = {};
      props[tag] = value;

      // @ts-ignore
      const requiredProps = type[1];
      for (const key in requiredProps) props[key] = f(requiredProps[key]);

      // @ts-ignore
      const optionalProps = type[2];
      if (optionalProps != null)
        for (const key in optionalProps) props[key] = f(optionalProps[key]);

      schemas.push({
        properties: props,
        required: Object.keys(requiredProps),
      });
    }

    return {
      type: 'object',
      required: [tag],
      anyOf: schemas,
    };
  }

  if (id === 22)
    // @ts-ignore Ref
    return { $ref: t[1] };

  if (id === 24) {
    const defs: Record<string, any> = {};

    // @ts-ignore
    const refs = t[2];
    for (const name in refs) defs[name] = f(refs[name]);

    // @ts-ignore
    const root = f(t[1]);
    root.$id = '';
    root.$defs = defs;

    return root;
  }

  return {};
};

const f = (t: TLoadedType): Record<string, any> =>
  (t[0] & 1) === 1 ? { anyOf: [null_t, __parse(t[0], t)] } : __parse(t[0], t);

export default f;
