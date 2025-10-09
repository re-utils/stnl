// TODO

import type { TInt } from '../src/type.js';
import { injectDependency } from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';
import type { LNumber } from '../src/limit.js';

// buffer: b
// offset: o
// cached offset: o0

/**
 * @param t
 * @returns 1 for 32bit integer, 2 for 64 bit integer, negative value for signed
 */
const integerInfo = (t: TInt): number => {
  if ((t as any).length === 1) return -2;

  // Set min to this to only do 1 check
  // If not specified it's smaller than -2147483648
  let min = -2147483649;
  let max = 4294967296;

  for (let i = 1; i < (t as any).length; i++) {
    const limit = ((t as any)[i] as LNumber);
    limit[0] === 0 ? min = limit[1] : max = limit[1];
  }

  // Change this to return fn call instead
  return min < -2147483648
    ? -2
    : max > 4294967295
      ? min < 0 ? -2 : 2
      : min < 0
        ? max <= 2147483647
          ? -1
          : -2
        : 1;
}

const var32Encode = isHydrating ? '' : injectDependency(
  '(n)=>{while(n>127){b[o++]=n&127|128;n>>>=7};b[o++]=n}'
);
const var32Len = isHydrating ? '' : injectDependency(
  '(n)=>n<=127?1:n<=16383?2:n<=209715?3:n<=268435455?4:5'
);
const var64Encode = isHydrating ? '' : injectDependency(
  '(n)=>{while(n>127n){b[o++]=Number(n&127n|128n);n>>=7n};b[o++]=Number(n)}'
);
const var64Len = isHydrating ? '' : injectDependency(
  '(n)=>n<=127n?1:n<=16383n?2:n<=209715n?3:n<=268435455n?4:n<=34359738367n?5:n<=4398046511103n?6:n<=562949953421311?7:n<=72057594037927940n?8:n<=9223372036854776000n?9:10'
);
