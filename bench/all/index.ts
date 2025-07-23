import { summary, run, bench, do_not_optimize } from 'mitata';
import type { Tests } from './utils.js';

import tests from './tests/index.js';
import cases from './src/index.js';

import {
  excludeCase,
  includeCase,
  excludeTest,
  includeTest,
  includeStartupCase,
  excludeStartupCase,
} from './filter.js';

const casesMap = new Map<string, [string, ReturnType<Tests[keyof Tests]>][]>();

// Map cases
for (const c of cases) {
  const name = c.name;
  if (excludeCase(name) || !includeCase(name)) continue;

  for (const test in c.tests) {
    // @ts-ignore
    const obj = [name, c.tests[test]()] as [any, any];
    if (casesMap.has(test)) casesMap.get(test)!.push(obj);
    else casesMap.set(test, [obj]);
  }
}

// Register to mitata
casesMap.forEach((val, key) => {
  if (excludeTest(key as any) || !includeTest(key as any)) return;

  summary(() => {
    console.log('Validating:', key);

    const suite = tests[key as keyof typeof tests];
    const suiteData = suite.filter((t) => t.benchmark).map((t) => t.data);

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

    console.log('Benchmarking with', suiteData.length, 'values\n');
  });
});

run();
