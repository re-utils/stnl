import type { AnySchema } from './builder.ts';

export const _nullSchema = { const: null };
export const _toConstSchema = <T>(primitive: T): { const: T } => ({ const: primitive });

export const _loadLimits = (
  obj: Record<string, any>,
  schema: AnySchema,
  startIndex: number,
): Record<string, any> => {
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

export const _loadProps = (schema: AnySchema): Record<string, Record<string, any>> => {
  const props: Record<string, Record<string, any>> = {};

  // @ts-ignore
  const requiredProps: Record<string, AnySchema> = schema[1];
  for (const key in requiredProps) props[key] = v7(requiredProps[key]);

  // @ts-ignore
  if (schema.length > 2) {
    // @ts-ignore
    const optionalProps: Record<string, AnySchema> | undefined = schema[2];
    for (const key in optionalProps) props[key] = v7(optionalProps[key]);
  }

  return props;
};

/**
 * Generic handler for other types
 */
export const _handleOtherTypes = (schema: AnySchema, id: number): Record<string, any> => {
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
  else if (id === 8)
    return {
      type: 'object',
      properties: _loadProps(schema),
      // @ts-ignore
      required: Object.keys(schema[1]),
    };
  else if (id === 10) {
    // @ts-ignore
    const prop = schema[1];
    // @ts-ignore
    const map: Record<string, Schema<Record<string, AnySchema>, any>> = schema[2];

    const cases: Record<string, any>[] = [];
    for (const key in map) {
      const currentSchema = map[key];

      const props = _loadProps(currentSchema);
      props[prop] = _toConstSchema(key);

      cases.push({
        properties: props,
        // @ts-ignore
        required: Object.keys(schema[1]),
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
    // @ts-ignore
    const root = v7(schema[1]);
    root.$id = '';

    const $defs: Record<string, Record<string, any>> = {
      // @ts-ignore
      $: root,
    };

    // @ts-ignore
    if (schema.length > 2) {
      // @ts-ignore
      const map: Record<string, AnySchema> | undefined = schema[2];
      for (const key in map) {
        const child = v7(map[key]);
        child.$id = key;
        $defs[key] = child;
      }
    }

    return { $defs, $ref: '$' };
  }

  throw new Error('Unknown schema base type: ' + id);
};

/**
 * Convert an stnl schema to a draft 07 JSON schema
 */
export const v7 = (schema: AnySchema): Record<string, any> => {
  // @ts-ignore
  const id: number = schema[0];
  return id === 9
    ? {
        type: 'array',
        // @ts-ignore
        items: schema[1].map(v7),
        // @ts-ignore Easier to compile than additionalItems
        maxItems: schema[1].length,
      }
    : _handleOtherTypes(schema, id);
};

/**
 * Convert an stnl schema to a OpenAPI v3 compatible JSON schema
 */
export const openapi3: typeof v7 = v7;

/**
 * Convert an stnl schema to a draft 2020-12 JSON schema
 */
export const v2020_12 = (schema: AnySchema): Record<string, any> => {
  // @ts-ignore
  const id: number = schema[0];
  return id === 9
    ? {
        type: 'array',
        // @ts-ignore
        prefixItems: schema[1].map(v7),
        items: false,
      }
    : _handleOtherTypes(schema, id);
};
