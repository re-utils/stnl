import { build, type t } from 'stnl';

export const schema = <const T extends t.TLoadedType>(
  s: T,
): ((o: t.TInfer<T>) => void) => {
  const assert = build.json.assert(s);
  const stringify = build.json.stringify(s);

  return (o) => {
    if (assert(o)) {
      console.log('Result:', stringify(o));
      JSON.parse(stringify(o));
    }
  };
};
