import type { TInfer, TLoadedType } from '../../type.js';

// Hardcode cases that can be optimized
const __number_list = (o: any[]) => {
  if (o.length > 1) {
    let _ = '[' + o[0];
    for (let i = 1; i < o.length; i++) _ += ',' + o[i];
    return _ + ']';
  }
  return o.length === 1 ? '[' + o[0] + ']' : '[]';
};
const __bool_list = (o: any[]) => {
  if (o.length > 1) {
    let _ = o[0] ? '[true' : '[false';
    for (let i = 1; i < o.length; i++) _ += o[i] ? ',true' : ',false';
    return _ + ']';
  }
  return o.length === 1 ? (o[0] ? '[true]' : '[false]') : '[]';
};

const __number = (o: any) => '' + o;
const __bool = (o: boolean) => (o ? 'true' : 'false');

/**
 * Get the compiled stringifier of a schema
 * @param t
 */
export default <T extends TLoadedType>(t: T): ((o: TInfer<T>) => string) => {
  let id = t[0];

  if (id === 0 || id === 2) return __number;
  if (id === 6) return __bool;

  if (id === 10) {
    // Matching with objects is faster than string comparison
    // Only if the object is not deoptimized
    const obj: Record<string, string> = {};
    // @ts-ignore
    for (let i = 0, list = t[1]; i < list.length; i++)
      obj[list[i]] = JSON.stringify(list[i]);

    return (a) => obj[a];
  }

  if (id === 14) {
    // @ts-ignore
    id = t[1][0];
    return id === 0 || id === 2
      ? __number_list
      : id === 6
        ? __bool_list
        : JSON.stringify;
  }

  return JSON.stringify;
};
