export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I extends U,
) => void
  ? I
  : never;

export type Evaluate<T> = {
  [K in keyof T]: T[K];
} & {};
