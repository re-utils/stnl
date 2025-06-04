import { build, l, t } from 'stnl';

const A = t.scope(
  t.record({
    x: t.ref('x'),
    y: t.ref('y'),
    next: t.nullable_self,
  }),
  { x: t.int },
);

export const B = t.scope(t.list(A, l.maxLen(5)), {
  y: l.string(l.maxLen(9)),
});
export type B = t.TInfer<typeof B>;

console.log(build.json.assert.code(B));
