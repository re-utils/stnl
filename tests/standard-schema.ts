import { compat, build, t, l } from 'stnl';

// Used for examples below
const user = t.dict({
  name: l.string(l.minLen(3), l.maxLen(16)),
  code: l.string(l.minLen(8), l.maxLen(32))
});

const schema = compat.toStandardSchema.v1(
  build.json.assert.compile(user),
  // Error message
  'User validation failed'
);

// Use standard schema
schema['~standard'].validate({});
