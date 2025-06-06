import { t } from 'stnl';
import { schema } from './utils.js';

const mock = schema(
  t.list(
    t.dict({
      name: t.string,
      pwd: t.string,
      id: t.list(t.float),
    }),
  ),
);
mock([
  {
    name: 'reve',
    pwd: '12345678',
    id: [9, 8.5, 10],
  },
]);
