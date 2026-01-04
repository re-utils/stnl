import { expect, describe, test } from 'bun:test';
import * as stnl from 'stnl';

export namespace types {
  export type Evaluate<T> = {
    [K in keyof T]: T[K];
  } & {};

  export type ReturnGuard<T> = T extends ((o: any) => o is infer R) ? R : null;

  export type Extends<A, B> = A extends B
    ? true
    : false & {
        A: A;
        B: B;
        '~': 'A does not extend B';
      };

  export type Equal<A, B> =
    (<G>() => G extends A ? 0 : 1) extends <G>() => G extends B ? 0 : 1
      ? true
      : false & {
          A: A;
          B: B;
          '~': 'A !== B';
        };

  export const ExpectTrue = <T extends true>(): T extends true ? void : never => null as any;
}

export namespace tests {
  export const toJSONCheck = <Truthy>(
    fn: (o: any) => o is Truthy,
    tests: {
      truthy: Record<string, Truthy>;
      falsy: Record<string, any>;
    },
  ): void => {
    describe('toJSONCheck', () => {
      for (const key in tests.truthy) {
        const value = tests.truthy[key];
        test(key + ' (expect true)', () => {
          expect(fn(value)).toBeTrue();
        });
      }

      for (const key in tests.falsy) {
        const value = tests.falsy[key];
        test(key + ' (expect false)', () => {
          expect(fn(value)).toBeFalse();
        });
      }
    });
  };
}
