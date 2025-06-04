import type { TFloat, TInt, TString } from './type.js';

// Type constraints
declare const _c: unique symbol;
export interface Limit<I extends number = number> {
  [_c]: I;
}

/**
 * Set minimum value for a number
 * @param n
 */
export const min = (n: number): LMin => [0, n] as any;
export type LMin = Limit<0>;

/**
 * Set maximum value for a number
 * @param n
 */
export const max = (n: number): LMax => [1, n] as any;
export type LMax = Limit<1>;

/**
 * Set minimum length for a string or array
 * @param n
 */
export const minLen = (n: number): LMinLen => [2, n] as any;
export type LMinLen = Limit<2>;

/**
 * Set maximum length for a string or array
 * @param n
 */
export const maxLen = (n: number): LMaxLen => [3, n] as any;
export type LMaxLen = Limit<3>;

/**
 * Set constant length for a string or array
 * @param n
 */
export const len = (n: number): LConstLen => [4, n] as any;
export type LConstLen = Limit<4>;

// Utils
export type LLen = LMinLen | LMaxLen | LConstLen;
export type LNumber = LMin | LMax;

/**
 * Create an integer type with limits
 * @param a
 */
export const int = (...a: LNumber[]): TInt => [0, ...a] as any;

/**
 * Create a float type with limits
 * @param a
 */
export const float = (...a: LNumber[]): TFloat => [2, ...a] as any;

/**
 * Create a string type with limits
 * @param a
 */
export const string = (...a: LLen[]): TString => [4, ...a] as any;
