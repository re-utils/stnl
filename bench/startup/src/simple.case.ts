import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { t, build } from 'stnl';
import Ajv from 'ajv/dist/jtd';

import { defineTest } from '@lib';
const f = defineTest();

await f.run('stnl', () =>
  build.json.assert.compile(
    t.dict({
      number: t.float,
      negNumber: t.float,
      maxNumber: t.float,
      string: t.string,
      longString: t.string,
      boolean: t.bool,
      deeplyNested: t.dict({
        foo: t.string,
        num: t.float,
        bool: t.bool,
      }),
      items: t.list(t.float),
    }),
  ),
);

await f.run('typebox', () =>
  Function(
    TypeCompiler.Code(
      Type.Object({
        number: Type.Number(),
        negNumber: Type.Number(),
        maxNumber: Type.Number(),
        string: Type.String(),
        longString: Type.String(),
        boolean: Type.Boolean(),
        deeplyNested: Type.Object({
          foo: Type.String(),
          num: Type.Number(),
          bool: Type.Boolean(),
        }),
        items: Type.Array(Type.Number()),
      }),
      [],
    ),
  )(),
);

await f.run('ajv', () =>
  new Ajv().compile({
    properties: {
      number: { type: 'float64' },
      negNumber: { type: 'float64' },
      maxNumber: { type: 'float64' },
      string: { type: 'string' },
      longString: { type: 'string' },
      boolean: { type: 'boolean' },
      deeplyNested: {
        properties: {
          foo: { type: 'string' },
          num: { type: 'float64' },
          bool: { type: 'boolean' },
        },
        additionalProperties: true,
      },
      items: {
        elements: { type: 'float64' },
      },
    },
    additionalProperties: true,
  }),
);

f.log();
