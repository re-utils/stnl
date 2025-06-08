import { defineCase } from '@utils';

import { TypeSystemPolicy } from '@sinclair/typebox/system';
import { Type } from '@sinclair/typebox';
import { createAccelerator } from 'json-accelerator';

TypeSystemPolicy.AllowArrayObject = true;
TypeSystemPolicy.AllowNaN = true;

const SanitizedString = Type.String({ sanitize: true });

export default defineCase({
  name: 'json-accelerator - jit',
  tests: {
    stringify: () =>
      createAccelerator(
        Type.Array(
          Type.Object({
            name: SanitizedString,
            pwd: SanitizedString,
            id: Type.Array(Type.Number()),
          }),
        ),
      ),
  },
});
