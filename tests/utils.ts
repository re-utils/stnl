import { build, type t } from 'stnl';

export const schema = <const T extends t.TLoadedType>(
  s: T,
): ((o: t.TInfer<T>) => void) => {
  console.log('Assert:', build.json.assert.code(s));
  console.log('Stringify:', build.json.stringify.code(s));

  const assert = build.json.assert.compile(s);
  const stringify = build.json.stringify.compile(s);

  return (o) => {
    if (assert(o)) {
      console.log('Result:', stringify(o));
      JSON.parse(stringify(o));
    }
  };
};
