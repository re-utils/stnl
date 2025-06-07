import { summary, run, bench, do_not_optimize } from 'mitata';
import type { Tests } from './utils.js';

import tests from './tests/index.js';
import cases from './src/index.js';

import { defineTest as measureStartup } from '../startup/lib.js';

import {
  excludeCase,
  includeCase,
  excludeTest,
  includeTest,
  includeStartupCase,
  excludeStartupCase,
} from './filter.js';

// Help message
if (process.argv.includes('--help')) {
  console.log('usage: bench <flags>');
  console.log('flags:');
  console.log('  --no-startup: skip startup benchmarking');
  console.log('  --only-startup: only run startup benchmarking');
  process.exit();
}

const casesMap = new Map<string, [string, ReturnType<Tests[keyof Tests]>][]>();

if (!process.argv.includes('--no-startup')) {
  const startupMeasures: Record<string, ReturnType<typeof measureStartup>> = {};

  // Map cases
  for (const c of cases) {
    const name = c.name;
    if (excludeCase(name) || !includeCase(name)) continue;

    for (const test in c.tests) {
      // @ts-ignore
      const createFn = c.tests[test];

      // Measure startup time of the init fn
      if (includeStartupCase(name) && !excludeStartupCase(name))
        await (startupMeasures[test] ??= measureStartup()).run(name, createFn);

      const obj = [name, createFn()] as [any, any];
      if (casesMap.has(test)) casesMap.get(test)!.push(obj);
      else casesMap.set(test, [obj]);
    }
  }

  for (const key in startupMeasures) {
    console.log('Startup time:', key);
    {
      const measures = startupMeasures[key];
      measures.log();
    }
    console.log();
  }

  // Run only startup benchmark
  if (process.argv.includes('--only-startup'))
    process.exit();
}

// Register to mitata
casesMap.forEach((val, key) => {
  if (excludeTest(key as any) || !includeTest(key as any)) return;

  summary(() => {
    console.log('Validating:', key);

    const suite = tests[key as keyof typeof tests];
    const suiteData = suite.map((t) => t.data);

    for (const [name, fn] of val) {
      console.log('- Checking:', name);

      // Check if function validate correctly
      for (const t of suite) t.validate(fn as any);

      bench(name + ` (${key})`, function* () {
        yield {
          [0]: () => suiteData,
          bench(data: any[]) {
            for (let i = 0; i < data.length; i++) do_not_optimize(fn(data[i]));
          },
        };
      });
    }

    console.log();
  });
});

await run();
