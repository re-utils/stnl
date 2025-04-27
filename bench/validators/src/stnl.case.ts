import { defineCase } from '@utils';

import buildValidateJson from 'stnl/compilers/validate-json/compose.js';
import buildStringifyJson from 'stnl/compilers/stringify-json/compose.js';

export default defineCase({
  name: 'stnl',
  tests: {
    assertLoose: buildValidateJson({
      props: {
        number: 'float',
        negNumber: 'float',
        maxNumber: 'float',
        string: 'string',
        longString: 'string',
        boolean: 'bool',
        deeplyNested: {
          props: {
            foo: 'string',
            num: 'float',
            bool: 'bool',
          },
        },
        items: { item: 'float' },
      },
    }),

    stringify: buildStringifyJson({
      item: {
        props: {
          name: 'string',
          pwd: 'string',
          id: { item: 'float' },
        },
      },
    }),
  },
});
