import type { Evaluate } from './types';

export interface Ref<out T extends string> {
  '~ref': T;
}
export type SelfRef = Ref<''>;
export type ResolveRef<
  RefMap extends Record<string, any>,
  RootType,
  CurrentType,
> = CurrentType extends SelfRef
  ? ResolveRef<RefMap, RootType, RootType>
  : CurrentType extends Ref<infer Id extends Extract<keyof RefMap, string>>
    ? ResolveRef<RefMap, RootType, RefMap[Id]>
    : CurrentType extends Record<string, any> | any[]
      ? {
          [K in keyof CurrentType]: ResolveRef<RefMap, RootType, CurrentType[K]>;
        }
      : CurrentType;

export interface Limit<out Type> {
  '~type': Type;
}
export type AnyLimit = Limit<any>;

export interface Schema<out Type, out Refs extends string> extends Ref<Refs> {
  '~type': Type;
  concat: <Limits extends Limit<Type>[]>(limits: Limits) => this;
}
export type AnySchema = Schema<any, any>;

export type InferScopeSchema<
  T extends Schema<any, any>,
  ResolveMap extends
    | {
        [K in T['~ref']]?: Schema<any, any>;
      }
    | undefined = undefined,
> = ResolveMap extends {}
  ? Schema<
      ResolveRef<
        {
          [K in keyof ResolveMap]: (ResolveMap[K] & {})['~type'];
        },
        T['~type'],
        T['~type']
      >,
      Exclude<T['~ref'] | (ResolveMap[keyof ResolveMap] & {})['~ref'], '' | keyof ResolveMap>
    >
  : Schema<T['~type'], Exclude<T['~ref'], ''>>;

/**
 * Any type
 */
export const any: Schema<unknown, never> = [0] as any;

/**
 * A float
 */
export const float: Schema<number, never> = [1] as any;

/**
 * An integer
 */
export const int: typeof float = [2] as any;

/**
 * A boolean
 */
export const bool: Schema<boolean, never> = [3] as any;

/**
 * A string
 */
export const string: Schema<string, never> = [4] as any;

/**
 * Make a type nullable
 * @param schema
 */
export const nullable = <T extends AnySchema>(schema: T): Schema<null | T['~type'], T['~ref']> =>
  [5, schema] as any;

/**
 * Create an enum schema
 * @param values
 */
export const discrete = <const T extends [string, string, ...string[]]>(
  values: T,
): Schema<T[number], never> => [6, values] as any;

/**
 * Create an array schema
 * @param item
 */
export const list = <T extends AnySchema>(item: T): Schema<T['~type'][], T['~ref']> =>
  [7, item] as any;

/**
 * Create an object schema
 * @param required
 * @param optional
 */
export const dict = <
  Required extends Record<string, AnySchema>,
  Optional extends Record<string, AnySchema> | undefined = undefined,
>(
  required: Required,
  optional?: Optional,
): Optional extends {}
  ? Schema<
      Evaluate<
        {
          [K in keyof Required]: Required[K]['~type'];
        } & {
          [K in keyof Optional]?: Optional[K]['~type'];
        }
      >,
      (Required[keyof Required] | Optional[keyof Optional])['~ref']
    >
  : Schema<
      Evaluate<{
        [K in keyof Required]: Required[K]['~type'];
      }>,
      Required[keyof Required]['~ref']
    > => (optional == null ? ([8, required] as any) : ([8, required, optional] as any));

/**
 * Create a tuple schema
 * @param items
 */
export const tuple = <const T extends [AnySchema, AnySchema, ...AnySchema[]]>(
  items: T,
): Schema<
  [
    ...{
      [K in keyof T]: T[K]['~type'];
    },
  ],
  T[number]['~ref']
> => [9, items] as any;

/**
 * Create a tagged union schema
 * @param prop
 * @param tags
 * @param map
 */
export const union = <
  const Discriminator extends string,
  Map extends Record<string, Schema<Record<string, AnySchema>, any>>,
>(
  prop: Discriminator,
  map: Map,
): Schema<
  Evaluate<
    {
      [K in keyof Map]: Map[K]['~type'] & Record<Discriminator, K>;
    }[keyof Map]
  >,
  Map[keyof Map]['~ref']
> => [10, prop, map] as any;

/**
 * Create a reference schema
 */
export const ref = <const T extends string>(name: T): Schema<Ref<T>, T> => [11, name] as any;

/**
 * Reference to the parent scope schema
 */
export const self: Schema<SelfRef, ''> = [11, ''] as any;

/**
 * Resolve unknown references of a schema
 * @param schema
 * @param map
 */
export const scope = <
  T extends AnySchema,
  ResolveMap extends
    | {
        [K in T['~ref']]?: AnySchema;
      }
    | undefined = undefined,
>(
  schema: T,
  map?: ResolveMap,
): InferScopeSchema<T, ResolveMap> =>
  map == null ? ([12, schema] as any) : ([12, schema, map] as any);

/**
 * Create a schema module
 * @param mod
 */
export const module = <const T extends Record<string, AnySchema>>(
  mod: T,
): {
  [K in keyof T]: InferScopeSchema<T[K], T>;
} => {
  const scopedMod: Record<any, AnySchema> = {};
  for (const key in mod) scopedMod[key] = scope(ref(key), mod);
  return scopedMod as any;
};

/**
 * Define custom metadata
 */
export const meta = (key: string, value: any): Limit<any> => [0, key, value] as any;

/**
 * Define the length upper bound
 */
export const maxLen = (len: number): Limit<string & any[]> => [1, len] as any;

/**
 * Define the length lower bound
 */
export const minLen = (len: number): Limit<string & any[]> => [2, len] as any;

/**
 * Define the string prefix
 */
export const startsWith = <const T extends string>(str: T): Limit<string> => [3, str] as any;

/**
 * Define maximum value of a type
 */
export const max = <T>(value: T): Limit<T> => [4, value] as any;

/**
 * Define minimum value of a type
 */
export const min = <T>(value: T): Limit<T> => [5, value] as any;

/**
 * Define exclusive maximum value of a type
 */
export const exclusiveMax = <T>(value: T): Limit<T> => [6, value] as any;

/**
 * Define exclusive minimum value of a type
 */
export const exclusiveMin = <T>(value: T): Limit<T> => [7, value] as any;
