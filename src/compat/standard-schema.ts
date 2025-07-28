import type { StandardSchemaV1 } from '@standard-schema/spec';

import { dependencies, compile } from '../build/json/assert.js';
import type { TLoadedType, TInfer } from '../type.js';

/**
 * Convert stnl schema to standard schema
 * @param t
 * @param errorMessage
 */
export const toV1 = <T extends TLoadedType>(t: T, errorMessage: string): StandardSchemaV1<any, TInfer<T>> => {
  const deps: string[] = ['{issues:[{message:' + JSON.stringify(errorMessage) + '}]}'];
  const str = compile(t, 'o', deps, false);

  return {
    '~standard': {
      version: 1,
      vendor: 'stnl',
      validate: Function(dependencies(deps) + ';return o=>' + str + '?{value:o}:d1')()
    }
  }
};
