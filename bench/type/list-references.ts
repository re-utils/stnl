import { bench } from '@ark/attest';
import { t } from 'stnl';

bench('stnl', () => {
  const _ = t.scope(
    t.dict({
      value: t.int,
      children: t.list(t.self),
    }),
  );

  type _ = t.TInfer<typeof _>;
}).types([246, 'instantiations']);
