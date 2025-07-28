import { defineCase } from '@utils';
import { t, build } from 'stnl';

export default defineCase({
  name: 'stnl - jit',
  tests: {
    assertLoose: () =>
      build.json.assert(
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

    stringify: () =>
      build.json.stringify(
        t.list(
          t.dict({
            name: t.string,
            pwd: t.string,
            id: t.list(t.float),
          }),
        ),
      ),
  },
});
