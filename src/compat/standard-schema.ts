import type { StandardSchemaV1 } from '@standard-schema/spec';

import { code } from '../build/json/assert.js';
import type { TLoadedType, TInfer } from '../type.js';

/**
 * Convert stnl schema to standard schema
 * @param t
 * @param errorMessage
 */
export const toV1 = <T extends TLoadedType>(
  t: T,
  errorMessage: string,
): StandardSchemaV1<any, TInfer<T>> => ({
  '~standard': {
    version: 1,
    vendor: 'stnl',
    validate: Function(
      'var e={issues:[{message:' +
        JSON.stringify(errorMessage) +
        '}]},f=(()=>{' +
        code(t) +
        '})();return(o)=>f(o)?{value:o}:e',
    )(),
  },
});
