import type { LLen } from './limit.js';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

declare const _: unique symbol;
type _ = typeof _;

declare const _ref: unique symbol;
type _ref = typeof _ref;

export interface IType<
  out I extends number = number,
  in out T = any,
  out R = any,
> extends Ref<R> {
  0: I;
  [_]: T;
  length: number;
}
export type TLoadedType = IType<number, any, never>;

// Userland infer type
export type TInfer<T extends TLoadedType> = T[_];

type TypeDict = Record<string, IType>;
type InferTypeList<T extends IType[]> = T extends [
  infer A extends IType,
  ...infer B extends IType[],
]
  ? [A[_], ...InferTypeList<B>]
  : [];

interface NullableMap {
  4: 5;
  10: 11;
  12: 13;
  14: 15;
  16: 17;
  18: 19;
  20: 21;
  22: 23;
}
type ToNullable<T extends IType<keyof NullableMap>> = IType<
  NullableMap[T[0]],
  T[_] | null,
  T[_ref]
>;

export type TInt = IType<0, number, never>;
export type TFloat = IType<2, number, never>;
export type TString = IType<4, string, never>;
export type TBool = IType<6, boolean, never>;
export type TAny = IType<8, unknown, never>;

// Non primitives
type CUnion = [string, string, ...string[]];
export type TUnion<T extends CUnion> = IType<10, T[number], never>;

type CConst = number | string | boolean;
export type TConst<T extends CConst> = IType<12, T, never>;

export type TList<T extends IType> = IType<14, T[_][], T[_ref]>;
export type TDict<Required extends TypeDict, Optional extends TypeDict> = IType<
  16,
  Prettify<
    {
      [K in keyof Required]: Required[K][_];
    } & {
      [K in keyof Optional]?: Optional[K][_];
    }
  >,
  (Required[keyof Required] | Optional[keyof Optional])[_ref]
>;

type CTuple = [IType, IType, ...IType[]];
export type TTuple<T extends CTuple> = IType<
  18,
  InferTypeList<T>,
  T[number][_ref]
>;

export type TTag<I extends string, T extends TypeDict> = IType<
  20,
  Prettify<
    {
      [K in keyof T]: { [N in I]: K } & T[K][_];
    }[keyof T]
  >,
  T[keyof T][_ref]
>;

// References
interface Ref<T> {
  [_ref]: T;
}
export type TRef<T> = IType<22, Ref<T>, T>;

type LoadRefList<T extends any[], M extends Record<string, any>> = T extends [
  infer A,
  ...infer B,
]
  ? [LoadRef<A, M>, ...LoadRefList<B, M>]
  : [];
type LoadRef<T, M extends Record<string, any>> = T extends Ref<
  infer K extends keyof M
>
  ? LoadRef<M[K], M>
  : T extends Record<string, any>
    ? {
        [K in keyof T]: LoadRef<T[K], M>;
      }
    : T extends any[]
      ? LoadRefList<T, M>
      : T;

// A scope that loads some references
export type TScope<
  T extends IType,
  R extends Record<any, IType | undefined>,
> = IType<
  24,
  LoadRef<
    T[_],
    {
      [K in keyof R]: (R[K] & {})[_];
    } & Ref<T[_]>
  >,
  Exclude<T[_ref], _ref | keyof R>
>;

// Primitives
export const int: TInt = [0] as any;
export const float: TFloat = [2] as any;
export const string: TString = [4] as any;
export const bool: TBool = [6] as any;
export const any: TAny = [8] as any;

/**
 * Create a nullable type
 * @param t
 */
export const nullable = <
  // Allow only non primitive types
  const T extends IType<keyof NullableMap>,
>(
  t: T,
): ToNullable<T> => (t as any as any[]).with(0, t[0] | 1) as any;

/**
 * Create an union schema
 * @param l
 * @returns
 */
export const union = <const T extends CUnion>(l: T): TUnion<T> =>
  [10, l] as any;

/**
 * Create a constant schema
 * @param t
 * @param nullable
 */
export const value = <const T extends CConst>(t: T): TConst<T> =>
  [12, t] as any;

/**
 * Create a list type
 */
export const list = <const T extends IType>(
  ...args: [type: T, ...LLen[]]
): TList<T> => [14, ...args] as any;

/**
 * Create a dict type
 * @param required - Required props
 * @param optional - Optional props
 */
export const dict = <
  Required extends TypeDict | null,
  Optional extends TypeDict = {},
>(
  required: Required,
  optional?: Optional,
): TDict<Required extends null ? {} : Required, Optional> =>
  [16, required, optional] as any;

/**
 * Create a tuple type
 * @param t
 */
export const tuple = <T extends CTuple>(t: T): TTuple<T> => [18, t] as any;

/**
 * Create a tagged union type
 * @param tag
 * @param map
 */
export const tag = <
  const I extends string,
  T extends Record<string, TDict<TypeDict, TypeDict>>,
>(
  tag: I,
  map: T,
): TTag<I, T> => [20, tag, map] as any;

/**
 * Create a reference to a type
 * @returns
 */
export const ref = <const T extends string>(t: T): TRef<T> => [22, t] as any;

/**
 * Reference to the scope type
 */
export const self: TRef<_ref> = [22] as any;

/**
 * Nullable reference to the type of the upper scope
 */
export const nullable_self: ToNullable<TRef<_ref>> = [23] as any;

interface FScope {
  <
    const T extends IType,
    const R extends {
      [K in Exclude<T[_ref], _ref>]?: IType;
    },
  >(
    t: T,
    r: R,
  ): TScope<T, R>;

  <const T extends IType>(t: T): TScope<T, {}>;
}
/**
 * Resolve some unresolved references of a type
 */
export const scope: FScope = ((t: any, r: any) => [24, t, r]) as any;
