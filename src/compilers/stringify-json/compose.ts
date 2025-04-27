import type {
  TType,
  TList,
  TTuple,
  TConst,
  TSchema,
  InferSchema,
  TBasic,
  TExtendedBasic,
  TRef,
} from '../../index.js';

type Fn = (o: any) => string;
type Refs = Record<string, Fn>;

// eslint-disable-next-line
const stringifyPrimitive = (val: any): string => '' + val;
const stringifyString = (val: string) => /["\b\t\n\v\f\r\/]/.test(val) ? JSON.stringify(val) : '"' + val + '"';
// eslint-disable-next-line
const stringifyPrimitiveArray = (val: any[]) => '[' + val.join() + ']';
// eslint-disable-next-line
const primitiveStringifier = (schema: TBasic) =>
  schema === 'any' ? JSON.stringify : schema === 'string' ? stringifyString : stringifyPrimitive;
// eslint-disable-next-line
const arrayStringifier =
  (each: (item: any, i: number) => any): Fn =>
  (o: any[]) =>
    '[' + o.map(each).join() + ']';

export const loadSchema = (schema: TType, refs: Refs): Fn => {
  if (typeof schema === 'string') return primitiveStringifier(schema);

  const fn = loadSchemaWithoutNullable(schema, refs);
  return schema.nullable === true
    ? // eslint-disable-next-line
      (o) => (o === null ? 'null' : fn(o))
    : fn;
};

export function loadSchemaWithoutNullable(
  schema: Exclude<TType, string>,
  refs: Refs,
): Fn {
  for (const key in schema) {
    if (key === 'type')
      // String
      return primitiveStringifier((schema as TExtendedBasic).type);

    if (key === 'item') {
      const stringifyItem = loadSchema((schema as TList).item, refs);

      return stringifyItem === stringifyPrimitive
        ? stringifyPrimitiveArray
        : arrayStringifier(stringifyItem);
    }

    // No optimizations
    if (
      key === 'props' ||
      key === 'optionalProps' ||
      key === 'tag' ||
      key === 'map'
    ) return JSON.stringify;

    if (key === 'const') {
      const c = JSON.stringify((schema as TConst).const);
      return () => c;
    }

    if (key === 'ref') {
      // Lazy loading
      let fn: Fn | undefined;
      return (o) => (fn ??= refs[(schema as TRef).ref])(o);
    }

    if (key === 'values') {
      const values = (schema as TTuple).values.map((val) =>
        loadSchema(val, refs),
      );
      return arrayStringifier((o: any, i: number): string => values[i](o));
    }
  }

  throw new Error('Invalid schema');
}

export default <const T extends TSchema>(
  schema: T,
): ((o: InferSchema<T>) => string) => {
  if (schema.defs == null)
    return loadSchema(schema, null as unknown as Refs) as any;

  const refs: Refs = {};

  const defs = schema.defs;
  for (const key in defs) refs[key] = null as any as Fn;
  for (const key in defs) refs[key] = loadSchema(defs[key], refs);

  return loadSchema(schema, refs) as any;
};
