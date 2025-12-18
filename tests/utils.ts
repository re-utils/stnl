import { expect, describe, test } from 'bun:test';
import * as stnl from 'stnl';
import type { AnySchema } from 'stnl/type';

export namespace types {
  export interface Exact<in out T> {
    '~': T;
  }

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
  export const toJSONAssert = (
    schema: AnySchema,
    tests: {
      truthy: Record<string, any>;
      falsy: Record<string, any>;
    },
  ): void => {
    describe('toJSONAssert', () => {
      const fn = stnl.toJSONAssert.compile(schema);

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
