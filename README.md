A simple type validator built for performance.

## Features
- Types work across languages
- Efficient representation format
- Fast compilation time

## Builder
`stnl` schema builder.
```ts
import { t, l } from 'stnl';
// or
import { type, limit } from 'stnl';
```

### Type inference
To infer payload type of a schema built using the schema builder:
```ts
const schema = t.list(t.int);

// number[]
type T = t.TInfer<typeof schema>;
```

### Primitives
- `t.int`: integer
- `t.float`: floating-point number
- `t.string`: string
- `t.bool`: boolean
- `t.any`: any type

```ts
t.int; // integer
t.float; // floating-point number
t.string; // strings
t.bool; // boolean
t.any; // any type

l.int(l.min(5)); // integer >= 5
l.int(l.max(9)); // integer <= 9
l.int(l.min(5), l.max(9)); // 5 <= integer <= 9

l.float(l.min(5)); // float >= 5
l.float(l.max(9)); // float <= 9
l.float(l.min(5), l.max(9)); // 5 <= float <= 9

l.string(l.minLen(5)); // string.length >= 5
l.string(l.maxLen(9)); // string.length <= 9
l.string(l.minLen(5), l.maxLen(9)); // 5 <= string.length <= 9
```

### Unions
```ts
// Match 'admin' or 'user'
t.union(['admin', 'user']);
```

### Constants
`t.value()` only accepts `number`, `string`, or `boolean`.
```ts
// Match only 0
t.value(0);

// Match only 'str'
t.value('str');

// Match only true
t.value(true);
```

### Lists
```ts
// A list of integers
t.list(t.int);

// A list of string with list.length >= 1
t.list(t.string, l.minLen(1));

// A list of float with list.length <= 10
t.list(t.float, l.maxLen(10));

// A list of float with 1 <= list.length <= 10
t.list(t.float, l.minLen(1), l.maxLen(10));
```

### Objects
```ts
// { id: number, name: string, display_names?: string[] }
t.dict(
  // Required properties
  {
    id: t.int,
    name: t.string
  },
  // Optional properties
  {
    display_names: t.list(t.string)
  }
);
```

### Tuples
```ts
// [number, string]
t.tuple([
  t.int,
  t.string
]);
```

### Tagged unions
```ts
// { role: 'admin', id: string } | { role: 'user', name: string }
t.tag('role', {
  admin: t.dict({
    id: t.string
  }),
  user: t.dict({
    name: t.string
  })
});
```

### Nullable types
To make a schema accepts `null`:
```ts
// { name: string, id: number } | null
t.nullable(
  t.dict({
    name: t.string,
    id: t.int
  })
);
```

### Scopes & references
Recursive types with scope:
```ts
// interface Node { value: string, next: Node | null }
const node = t.scope(
  t.dict(
    { value: t.string },
    { next: t.self } // Reference to the root type of the scope
  )
);
```

References defined types in scope:
```ts
const user = t.scope(
  t.dict({
    name: t.ref('name')
  }),
  { name: t.string }
};
```

Generics with scope:
```ts
// node is an unresolved type
const node = t.dict(
  { value: t.ref('type') },
  { next: t.self }
);

// This will error as not all references of node has been resolved
type Node = t.TInfer<typeof node>;

// int_node is a resolved type
const int_node = t.scope(node, {
  type: t.int
});
```

## Compilers
`stnl` schema compilers.
```ts
import { build } from 'stnl';
```

### Assert JSON
```ts
const schema = t.dict({
  name: l.string(l.minLen(3), l.maxLen(16)),
  code: l.string(l.minLen(8), l.maxLen(32))
});

// Build to a function
const isUser = build.json.assert.compile(schema);

// Usage:
if (isUser(user)) {
  console.log('Name', user.name);
  console.log('Code', user.code);
}
```

For code injection to other functions:
```ts
const schema = t.dict({
  name: l.string(l.minLen(3), l.maxLen(16)),
  code: l.string(l.minLen(8), l.maxLen(32))
});

// Build to code
console.log(build.json.assert.code(schema));
```
