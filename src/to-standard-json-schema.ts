import { openapi3, v2020_12, v7 } from './to-json-schema.ts';
import type { AnySchema } from './builder.ts';
import type { StandardJSONSchemaV1 } from '@standard-schema/spec';

const output = () => {
  throw new Error('Conversion is not supported!');
};

function inputV1(
  this: { _: AnySchema } & StandardJSONSchemaV1.Converter,
  options: StandardJSONSchemaV1.Options,
) {
  const target = options.target;

  if (target === 'draft-07') {
    const schema = v7(this._);
    schema.$schema = 'http://json-schema.org/draft-07/schema';
    return schema;
  } else if (target === 'draft-2020-12') {
    const schema = v2020_12(this._);
    schema.$schema = 'https://json-schema.org/draft/2020-12/schema';
    return schema;
  } else if (target === 'openapi-3.0') return openapi3(this._);

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
      input: inputV1,
      output,
    },
  },
});
