import { bench, do_not_optimize, run, summary } from 'mitata';
import users from './data/users.json';

import { TypeCompiler } from '@sinclair/typebox/compiler';
import { TypeSystemPolicy } from '@sinclair/typebox/system';
import { Type } from '@sinclair/typebox';

import { t, build } from 'stnl';

summary(() => {
  const setup = (label: string, matcher: (o: any) => boolean) => {
    // @ts-ignore
    for (const user of users) do_not_optimize(matcher(user));

    bench(label, () => {
      // @ts-ignore
      for (let i = 0; i < users.length; i++) do_not_optimize(matcher(users[i]));
    });
  };

  {
    TypeSystemPolicy.AllowArrayObject = true;
    TypeSystemPolicy.AllowNaN = true;

    const schema = Type.Object({
      name: Type.String(),
      id: Type.Integer(),
      friends: Type.Array(
        Type.Object({
          id: Type.Integer(),
        }),
      ),
    });

    setup('typebox', Function(TypeCompiler.Code(schema, []))());
  }

  setup(
    'stnl',
    build.json.assert.compile(
      t.record({
        name: t.string,
        id: t.int,
        friends: t.list(
          t.record({
            id: t.int,
          }),
        ),
      }),
    ),
  );
});

run();
