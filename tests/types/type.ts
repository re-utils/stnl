import type { Equal, Exact, Expect, Extends } from '../utils.ts';
import { t, toJSONAssert } from 'stnl';

// A list of objects
{
  const Users = t.list(
    t.dict({
      name: t.string,
      pwd: t.string,
      id: t.list(t.float),
    }),
  );
  type Users = (typeof Users)['~type'];

  type _ = Expect<
    Equal<
      Users,
      {
        name: string;
        pwd: string;
        id: number[];
      }[]
    >
  >;

  console.log(toJSONAssert.code(Users));
}
