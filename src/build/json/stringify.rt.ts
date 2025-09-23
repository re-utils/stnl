import type { TLoadedType } from '../../type.js';
import { injectDependency, lazyDependency, noOp } from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';

const NUMBER_LIST = isHydrating
  ? noOp
  : lazyDependency(
      injectDependency,
      '(o)=>{if(o.length>1){let s="["+o[0];for(let i=1;i<o.length;i++)s+=","+o[i];return s+"]"}return o.length===1?"["+o[0]+"]":"[]"}',
    );

const BOOL_LIST = isHydrating
  ? noOp
  : lazyDependency(
      injectDependency,
      '(o)=>{if(o.length>1){let s=o[0]?"[true":"[false";for(let i=1;i<o.length;i++)s+=o[i]?",true":",false";return s+"]"}return o.length===1?o[0]?"[true]":"[false]":"[]"}',
    );

/**
 * Get the compiled stringifier of a schema
 * @param t
 */
export default (isHydrating ? noOp : (t, input) => {
  let id = t[0];

  if (id === 0 || id === 2) return '""+' + input;
  if (id === 6) return input + '?"true":"false"';

  if (id === 10) {
    // Matching with objects is faster than string comparison
    // Only if the object is not deoptimized
    const obj: Record<string, string> = {};
    // @ts-ignore
    for (let i = 0, list = t[1]; i < list.length; i++)
      obj[list[i]] = JSON.stringify(list[i]);
    return injectDependency(JSON.stringify(obj)) + '[' + input + ']';
  }

  if (id === 14) {
    // @ts-ignore
    id = t[1][0];
    return (
      (id === 0 || id === 2
        ? NUMBER_LIST()
        : id === 6
          ? BOOL_LIST()
          : 'JSON.stringify') +
      '(' +
      input +
      ')'
    );
  }

  return 'JSON.stringify(' + input + ')';
}) as (t: TLoadedType, input: string) => string;
