import type { LNumber } from "../limit.js";
import type { TInt } from "../type.js";

// Optimize direct calls from function
export const optimizeDirectCall = (s: string): string =>
  s === 'o=>Number.isInteger(o)'
    ? 'Number.isInteger'
    : s === 'o=>JSON.stringify(o)'
      ? 'JSON.stringify'
      : /^o=>d\d+\(o\)$/.test(s)
        ? s.slice(3, -3)
        : s;

/**
 * Get integer type byte size and signness
 * @param t
 */
export const integerInfo = (t: TInt): number => {
  if ((t as any).length === 1) return -8;

  // Set min to this to only do 1 check
  // If not specified it's smaller than -2147483648
  let min = -2147483649;
  let max: number | undefined;

  for (let i = 1; i < (t as any).length; i++) {
    const limit = ((t as any)[i] as LNumber);
    limit[0] === 0 ? min = limit[1] : max = limit[1];
  }

  if (min < -2147483648) return -8;
  if (max == null) return min < 0 ? -8 : 8;

  // Signness
  // Only needs to check min here cuz if max < 0
  // Min not specified -> -8
  // Specified min is guaranteed to be smaller than 0
  return min < 0
    ? min >= -128 && max <= 127
      ? -1
      : min >= -32768 && max <= 32767
        ? -2
        : max <= 2147483647
          ? -4
          : -8
    : max <= 255
      ? 1
      : max <= 65536
        ? 2
        : max <= 4294967295
          ? 4
          : 8;
}
