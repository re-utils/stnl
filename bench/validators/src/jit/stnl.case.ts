import { defineCase } from '@utils';
import { build as buildValidateJson } from 'stnl/compilers/validate-json';
import { build as buildStringifyJson } from 'stnl/compilers/stringify-json';

export default defineCase({
  name: 'stnl - jit',
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
