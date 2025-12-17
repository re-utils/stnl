import { v7 } from './to-json-schema';
import type { Schema } from './type.ts';
import type { StandardJSONSchemaV1 } from '@standard-schema/spec';

/**
 * Convert an stnl schema to a standard JSON schema.
 */
export const json = <T>(schema: Schema<T, any>): StandardJSONSchemaV1<any, T> => ({
  '~standard': {
    version: 1,
    vendor: 'stnl',
    jsonSchema: {
      input: () => ({}),
      output: (options) => {
        if (options.target === 'draft-07') return v7(schema) as any;
        throw new Error('Unsupported target: ' + options.target);
      },
    },
  },
});
