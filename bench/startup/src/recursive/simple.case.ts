import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { t, build } from 'stnl';
import Ajv from 'ajv/dist/jtd';

import { defineTest } from '@lib';
import { type } from 'arktype';
const f = defineTest();

f.run('stnl', () =>
  build.json.assert.compile(
    t.scope(t.dict({ name: t.string }, { next: t.self })),
  ),
);

f.run('typebox', () =>
  Function(
    TypeCompiler.Code(
      Type.Recursive((This) =>
        Type.Object({
          name: Type.String(),
          next: Type.Optional(This),
        }),
      ),
      [],
    ),
  )(),
);

f.run('ajv', () =>
  new Ajv().compile({
    definitions: {
      self: {
        properties: {
          name: { type: 'string' },
        },
        optionalProperties: {
          next: { ref: 'self' },
        },
        additionalProperties: true,
      },
    },
    ref: 'self',
  }),
);

f.run('arktype', () =>
  type.module({
    self: {
      name: 'string',
      'next?': 'self'
    }
  }).self
);

f.log();
