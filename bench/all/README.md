Testing validators performance.

```sh
bun prep # Prepare test suites

bun bench:bun # Bun
bun bench:node # Node

bun bench # Both runtime
bun start # Run prep and bench
```

## Filter
You can filter tests by changing the code in `filter.ts`.

## Setup
You can change setup code by manually changing `prepare.ts` or add a new `*.build.ts` file in `src`.
