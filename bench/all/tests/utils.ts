import { randomUUID } from 'node:crypto';

export const randomStr = (l = 2) => {
  let str = '';
  while (l-- > 0) str += randomUUID();
  return str;
};

export const randPick = <T>(arr: T[]): T =>
  arr[Math.round(Math.random() * (arr.length - 1))];

export const randRemoveProp = <T>(x: T): void => {
  // @ts-ignore
  delete x[randPick(Object.keys(x))];
};
