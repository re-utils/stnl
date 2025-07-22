import { l, t } from 'stnl';
import { schema } from './utils.js';

const A = t.scope(
  t.dict({
    x: t.ref('x'),
    y: t.ref('y'),
    next: t.nullable_self,
  }),
  { x: t.int },
);

export const B = t.scope(t.list(A, l.maxLen(5)), {
  y: t.int,
});
export type B = t.TInfer<typeof B>;

const mock = schema(B);
mock([
  {
    x: 5,
    y: 6,
    next: {
      x: 7,
      y: 8,
      next: null,
    },
  },
]);
