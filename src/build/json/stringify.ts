import type { TInfer, TLoadedType } from '../../type.js';

// TODO: Optimize unions and constants

// Hardcode cases that can be optimized
const __number_list = (o: any[]) => {
  let _ = '[';
  for (let i = 0; i < o.length; i++)
    _ += (i === 0 ? '' : ',') + o[i];
  return _ + ']';
};
const __bool_list = (o: any[]) => {
  let _ = '[';
  for (let i = 0; i < o.length; i++)
    _ += (i === 0 ? '' : ',') + (o[i] ? 'true' : 'false');
  return _ + ']';
};

const __number = (o: any) => '' + o;
const __bool = (o: boolean) => o ? 'true' : 'false';

/**
 * Get the compiled stringifier of a schema
 * @param t
 */
export const compile = <T extends TLoadedType>(
  t: T,
): ((o: TInfer<T>) => string) => {
  let id = t[0];

  if (id === 0 || id === 2)
    return __number;
  if (id === 6)
    return __bool;

  if (id === 10) {
    // @ts-ignore
    const list: string[] = t[1];

    let code = 'return o=>';
    for (let i = 1; i < list.length; i++) {
      const key = JSON.stringify(list[i]);
      code += 'o===' + key + '?"\\' + key + '\\":';
    }

    return Function(code + '"\\' + JSON.stringify(list[0]) + '"\\')();
  }

  if (id === 12) {
    // @ts-ignore
    const x = typeof t[1] === 'string' ? JSON.stringify(t[1]) : '' + t[1];
    return () => x;
  }

  if (id === 14) {
    // @ts-ignore
    id = t[1][0];
    return id === 0 || id === 2 ? __number_list : id === 6 ? __bool_list : JSON.stringify;
  }

  return JSON.stringify;
};
