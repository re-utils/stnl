import { defineCase } from '@utils';
import { type } from 'arktype';

export default defineCase({
  name: 'arktype - jit',
  tests: {
    assertLoose() {
      const schema = type({
        number: 'number',
        negNumber: 'number',
        maxNumber: 'number',
        string: 'string',
        longString: 'string',
        boolean: 'boolean',
        deeplyNested: {
          foo: 'string',
          num: 'number',
          bool: 'boolean',
        },
        items: 'number[]',
      });

      return (o) => schema.allows(o);
    },
  },
});
