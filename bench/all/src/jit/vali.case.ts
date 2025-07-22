import { defineCase } from '@utils';
import createValidator from '@inbestigator/vali';

export default defineCase({
  name: '@inbestigator/vali - jit',
  tests: {
    assertLoose: () =>
      createValidator({
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
        items: ['number'],
      }),
  },
});
