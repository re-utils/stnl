import type { AnySchema } from './type.ts';

/**
 * Define possible output keywords of an stnl schema
 */
export interface V7Schema {
  type?: 'string' | 'number' | 'integer' | 'array' | 'object' | 'boolean';

  anyOf?: V7Schema[];

  $defs?: {
    [key: string]: Omit<V7Schema, '$id'> & { $id: string }
  };
  $id?: '';
  $ref?: string;

  const?: unknown;

  items?: V7Schema | false;
  prefixItems?: V7Schema[];

  properties?: Record<string, V7Schema>;
  required?: string[];

  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;

  minLength?: number;
  maxLength?: number;

  pattern?: string;
}

export const _nullSchema = { const: null };
export const _toConstSchema = <T>(primitive: T): { const: T } => ({ const: primitive });

export const _loadLimits = (obj: V7Schema, schema: AnySchema, startIndex: number): V7Schema => {
  // @ts-ignore
  while (startIndex < schema.length) {
    // @ts-ignore
    const limit: Limit = schema[startIndex++];
    const id: number = limit[0];

    if (id === 1) obj.maxLength = limit[1];
    else if (id === 2) obj.minLength = limit[1];
    else if (id === 3) obj.pattern = '^' + RegExp.escape(limit[1]);
    else if (id === 4) obj.maximum = limit[1];
    else if (id === 5) obj.minimum = limit[1];
    else if (id === 6) obj.exclusiveMaximum = limit[1];
    else if (id === 7) obj.exclusiveMinimum = limit[1];
    else throw new Error('Unknown limit type: ' + id);
  }

  return obj;
};

/**
 * Convert an stnl schema to a draft-07 JSON schema
 */
export const v7 = (schema: AnySchema): V7Schema => {
  // @ts-ignore
  const id: number = schema[0];
  if (id === 0) return _loadLimits({}, schema, 1);
  else if (id === 1) return _loadLimits({ type: 'number' }, schema, 1);
  else if (id === 2) return _loadLimits({ type: 'integer' }, schema, 1);
  else if (id === 3) return { type: 'boolean' };
  else if (id === 4) return _loadLimits({ type: 'string' }, schema, 1);
  else if (id === 5)
    return {
      anyOf: [
        _nullSchema,
        // @ts-ignore
        v7(schema[1]),
      ],
    };
  else if (id === 6)
    return {
      // @ts-ignore
      anyOf: schema[1].map(_toConstSchema),
    };
  else if (id === 7)
    return _loadLimits(
      {
        type: 'array',
        // @ts-ignore
        items: v7(schema[1]),
      },
      schema,
      2,
    );
  else if (id === 8) {
    const props: Record<string, V7Schema> = {};

    // @ts-ignore
    const requiredProps: Record<string, AnySchema> = schema[1];
    for (const key in requiredProps) props[key] = v7(requiredProps[key]);

    // @ts-ignore
    const optionalProps: Record<string, AnySchema> | undefined = schema[2];
    if (optionalProps != null) for (const key in optionalProps) props[key] = v7(optionalProps[key]);

    return {
      type: 'object',
      properties: props,
      required: Object.keys(requiredProps),
    };
  } else if (id === 9)
    return {
      type: 'array',
      // @ts-ignore
      prefixItems: schema[1].map(v7),
      items: false,
    };
  else if (id === 10) {
    // @ts-ignore
    const prop = schema[1];
    // @ts-ignore
    const map: Record<string, Schema<Record<string, AnySchema>, any>> = schema[2];

    const cases: V7Schema[] = [];
    for (const key in map) {
      const currentSchema = map[key];

      const props: Record<string, V7Schema> = {};
      props[prop] = _toConstSchema(key);

      // @ts-ignore
      const requiredProps: Record<string, AnySchema> = currentSchema[1];
      for (const key in requiredProps) props[key] = v7(requiredProps[key]);

      // @ts-ignore
      const optionalProps: Record<string, AnySchema> | undefined = currentSchema[2];
      if (optionalProps != null)
        for (const key in optionalProps) props[key] = v7(optionalProps[key]);

      cases.push({
        properties: props,
        required: Object.keys(requiredProps),
      });
    }

    return {
      type: 'object',
      required: [prop],
      anyOf: cases,
    };
  } else if (id === 11)
    return {
      // @ts-ignore
      $ref: schema[1],
    };
  else if (id === 12) {
    const defs: V7Schema['$defs'] & {} = {};

    // @ts-ignore
    const map: Record<string, AnySchema> | undefined = schema[2];
    for (const key in map) {
      const schema = map[key];
      // @ts-ignore also a root schema
      if (schema[0] === 12)
        defs[key] = { $id: key as any, anyOf: [v7(schema)] };
      else {
        const child = v7(schema);
        child.$id = key as any;
        defs[key] = child as any;
      }
    }

    // @ts-ignore
    const root = v7(schema[1]);
    root.$id = '';
    root.$defs = defs;

    return root;
  } else if (id === 13)
    // @ts-ignore
    return v7(schema[1]);

  throw new Error('Unknown schema base type: ' + id);
};
