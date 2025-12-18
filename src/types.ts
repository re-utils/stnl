export type Evaluate<T> = {
  [K in keyof T]: T[K];
} & {};
