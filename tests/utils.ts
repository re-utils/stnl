export interface Exact<in out T> {
  '~': T;
}

export type Expect<T extends true> = T;
export type Extends<A, B> = A extends B
  ? true
  : false & {
      A: A;
      B: B;
      '~': 'A does not extend B';
    };
export type Equal<A, B> =
  Exact<A> extends Exact<B>
    ? true
    : false & {
        A: A;
        B: B;
        '~': 'A does not equal B';
      };
