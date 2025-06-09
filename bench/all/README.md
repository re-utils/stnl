Testing validators performance.

Requirements: [`bun`](https://bun.sh), [`node`](https://nodejs.org)

And install all dependencies in [root](../..) and [bench](../) directory.
```sh
# From current README directory
cd .. && bun i
cd .. && bun i
cd bench/all
```

```sh
bun prep # Prepare test suites

bun bench:bun # Bun
bun bench:node # Node

bun bench:bun --startup # Only run startup time bench
```

## Tests
You can modify test data in [tests](./tests).

To add a new test simply create a file named `(test_name).case.ts` and return a list of objects that matches:
```ts
interface _ {
  data: any;
  validate: (validator: (o: any) => any) => any; // Throws here if the validator is not valid
}
```

## Filter
You can filter tests by changing the code in `filter.ts`.

## Setup
You can change setup code by manually changing `prepare.ts` or add a new `*.build.ts` file in `src`.
