A simple type validator built for performance.

## Features
- Types work across languages
- Efficient representation format
- Fast compilation time

## Builder
`stnl` schema builder.
```ts
import { t } from 'stnl';
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
- `t.nullable_string`: string or `null`
- `t.bool`: boolean
- `t.any`: any type

To set integer/float range or string size limit, use `t.limit`:
```ts
// value >= 1
t.limit(t.int, 1);

// value <= 10
t.limit(t.int, null, 10);

// 1 <= value <= 10
t.limit(t.float, 1, 10);

// str.length >= 8
t.limit(t.string, 8);

// str.length <= 32
t.limit(t.string, null, 32);

// 8 <= str.length <= 32
t.limit(t.string, 8, 32);
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
t.list(t.string, 1);

// A list of float with list.length <= 10
t.list(t.float, 0, 10);

// A list of float with 1 <= list.length <= 10
t.list(t.float, 1, 10);
```

### Records
```ts
// { id: number, name: string, display_names?: string[] }
t.record(
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
  admin: t.record({
    id: t.string
  }),
  user: t.record({
    name: t.string
  })
});
```

### Nullable types
To make a schema accepts `null`:
```ts
// { name: string, id: number } | null
t.nullable(
  t.record({
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
  t.record(
    { value: t.string },
    { next: t.self } // Reference to the root type of the scope
  )
);
```

References defined types in scope:
```ts
const user = t.scope(
  t.record({
    name: t.ref('name')
  }),
  { name: t.limit(t.string, 3, 16) }
};
```

Generics with scope:
```ts
// node is an unresolved type
const node = t.record(
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
const schema = t.record({
  name: t.limit(t.string, 3, 16),
  code: t.limit(t.string, 8, 32)
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
const schema = t.record({
  name: t.limit(t.string, 3, 16),
  code: t.limit(t.string, 8, 32)
});

// Build to code
console.log(build.json.assert.code(schema));
```
