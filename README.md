# Library template

An NPM library template using Bun.

```sh
bun create https://github.com/aquapi/lib-template
```

## Scripts

All script sources and usage.

### [Build](./scripts/build.ts)

Emit `.mjs` and `.d.ts` files to [`lib`](./lib).

```sh
bun task build
```

### [Publish](./scripts/publish.ts)

Publish the package.

```sh
bun task publish
```

### [Bench](./scripts/bench.ts)

Run all files that ends with `.bench.ts` in [`bench`](./lib).

```sh
bun task bench
```

To run a specific file.

```sh
bun task bench index # Run bench/index.bench.ts
```

To run the benchmarks in `node`.
```bash
bun task bench --node

bun task bench --node index # Run bench/index.bench.ts with node
```

### [Size report](./scripts/report-size.ts)

Report code size, minified size, gzipped size and minified gzipped size of every **built** entrypoint.

```sh
bun task report-size
```
