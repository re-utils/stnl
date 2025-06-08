import { defineCase } from '@utils';
import { array, safeParse, boolean, number, object, string } from 'valibot';

export default defineCase({
  name: 'valibot',
  tests: {
    assertLoose() {
      const schema = object({
        number: number(),
        negNumber: number(),
        maxNumber: number(),
        string: string(),
        longString: string(),
        boolean: boolean(),
        deeplyNested: object({
          foo: string(),
          num: number(),
          bool: boolean(),
        }),
        items: array(number()),
      });

      return (o) => safeParse(schema, o).success;
    },
  },
});
