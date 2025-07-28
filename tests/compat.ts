import { compat, t, l } from 'stnl';

// Used for examples below
const user = t.dict({
  name: l.string(l.minLen(3), l.maxLen(16)),
  code: l.string(l.minLen(8), l.maxLen(32)),
});

// Standard schema
console.log(
  'Standard schema:',
  compat.standardSchema
    .toV1(user, 'User validation failed')
    ['~standard'].validate.toString(),
);

// JSON schema
console.log('JSON schema:', compat.toJSONSchema(user));
