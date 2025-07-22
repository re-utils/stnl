import { defineCase } from '@utils';
import joi from 'joi';

export default defineCase({
  name: 'joi',
  tests: {
    assertLoose() {
      const schema = joi.object({
        number: joi.number(),
        negNumber: joi.number(),
        maxNumber: joi.number(),
        string: joi.string(),
        longString: joi.string(),
        boolean: joi.boolean(),
        deeplyNested: joi.object({
          foo: joi.string(),
          num: joi.number(),
          bool: joi.boolean(),
        }),
        items: joi.array().items(joi.number()),
      });

      const opts = {
        presence: 'required',
        abortEarly: true,
        allowUnknown: true
      } satisfies joi.ValidationOptions;
      return (o) => schema.validate(o, opts).error == null;
    },
  },
});
