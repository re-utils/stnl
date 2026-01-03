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

  // Reverse the property parsing
  type OptionalIfUndefined<T> = {
    [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
  } & {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K];
  };
  type DeoptimizeProperty<T extends string> = T extends `${infer Start}_${infer End}`
    ? `${Start}-${DeoptimizeProperty<End>}`
    : T;
  type ValidHeaders<T extends stnl.toHeadersParser.HeadersSchema['~type']> = OptionalIfUndefined<{
    [K in Extract<keyof T, string> as DeoptimizeProperty<K>]: null extends T[K]
      ? undefined | string
      : string;
  }>;

  export const toHeadersParser = <Fn extends stnl.toHeadersParser.HeadersParser<any>>(
    fn: Fn,
    tests: {
      truthy: Record<string, ValidHeaders<ReturnType<Fn> & {}>>;
      falsy: Record<string, Record<string, string>>;
    },
  ): void => {
    describe('toHeadersParser', () => {
      for (const key in tests.truthy) {
        const value = tests.truthy[key];
        test(key + ' (expect not null)', () => {
          const parsed = fn(new Headers(value as {}))!;

          for (const key in parsed) {
            const originalKey = key.replace(/_/g, '-');
            if (parsed[key] === null) expect(value).not.toHaveProperty(originalKey);
            if (typeof parsed[key] === 'boolean')
              // @ts-ignore
              expect(value[originalKey] != null).toEqual(parsed[key]);
            else
              // @ts-ignore
              expect(value[originalKey]).toEqual(parsed[key]);
          }
        });
      }

      for (const key in tests.falsy) {
        const value = tests.falsy[key];
        test(key + ' (expect null)', () => {
          expect(fn(new Headers(value))).toBeNull();
        });
      }
    });
  };
}
