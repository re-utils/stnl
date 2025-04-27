import { summary, run, bench, do_not_optimize } from 'mitata';
import type { Tests } from './utils.js';
import tests from './tests/index.js';
import cases from './src/index.js';

import { excludeCase, includeCase, excludeTest, includeTest } from './filter.js';

const casesMap = new Map<string, [string, Tests[keyof Tests]][]>();

// Map cases
for (const c of cases) {
  const name = c.name;
  if (excludeCase(name) || !includeCase(name)) continue;

  for (const test in c.tests) {
    const fn = c.tests[test as keyof typeof c.tests];

    if (casesMap.has(test)) casesMap.get(test)!.push([name, fn]);
    else casesMap.set(test, [[name, fn]]);
  }
}

// Register to mitata
casesMap.forEach((val, key) => {
  if (excludeTest(key as any) || !includeTest(key as any)) return;

  summary(() => {
    console.log('Validating:', key);

    const suite = tests[key as keyof typeof tests];
    const suiteData = suite.map((t) => t.data);

    for (const test of val) {
      console.log('- Checking:', test[0]);
      const fn = test[1];

      // Check if function validate correctly
      for (const t of suite)
        t.validate(fn as any);

      console.log(test[0], fn.toString());

      bench(test[0] + ` (${key})`, function* () {
        yield {
          [0]() {
            return suiteData;
          },
          bench(suiteData: any) {
            do_not_optimize(suiteData.map(fn as any));
          },
        };
      });
    }
  });
});

run();
