import { v7 } from './to-json-schema.ts';
import type { AnySchema } from './type.ts';
import type { StandardJSONSchemaV1 } from '@standard-schema/spec';

const input = () => {
  throw new Error('Conversion is not supported!');
};

function outputV1(
  this: { _: AnySchema } & StandardJSONSchemaV1.Converter,
  options: StandardJSONSchemaV1.Options,
) {
  if (options.target === 'draft-07') return v7(this._) as Record<string, unknown>;
  throw new Error('Unsupported JSON schema target: ' + options.target);
}

/**
 * Convert a stnl schema to a `StandardJSONSchemaV1`.
 */
export const v1 = <T extends AnySchema>(schema: T): StandardJSONSchemaV1<any, T['~type']> => ({
  '~standard': {
    version: 1,
    vendor: 'stnl',
    jsonSchema: {
      // @ts-ignore
      _: schema,
      input,
      output: outputV1,
    },
  },
});
