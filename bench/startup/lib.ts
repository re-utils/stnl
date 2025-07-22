import { measure, now } from 'mitata/src/lib.mjs';
import { createColors } from 'picocolors';

const pc = createColors(true);

const createUnitFormat = (units: string[]) => (n: number) => {
  let i = 0;
  while (n >= 1000 && i < units.length - 1) {
    i++;
    n /= 1000;
  }
  return pc.yellowBright(n.toFixed(2) + units[i]);
};

export const format = {
  time: createUnitFormat(['ns', 'us', 'ms', 's']),
  name: (name: string) => pc.bold(pc.cyan(name)),
  multiplier: (x: number) => pc.greenBright(x.toFixed(2) + 'x'),
  header: pc.bold,
  success: pc.greenBright,
  error: pc.redBright,
};

const exec = new Function(
  'n',
  'f',
  '"use strict";var a=n();f();var b=n();return b-a',
);
await measure(now);

export const defineTest = () => {
  const results: { name: string; ns: number }[] = [];

  const run = (name: string, f: () => any) =>
    results.push({
      name,
      ns: exec(now, f),
    });

  const log = () => {
    results.sort((a, b) => a.ns - b.ns);
    const baseline = results[0].ns;

    for (let i = 0; i < results.length; i++) {
      const res = results[i].ns;
      console.log(
        `  ${format.name(results[i].name)}: ${format.time(res)}${
          i === 0 ? '' : ` - ${format.multiplier(res / baseline)} slower`
        }`,
      );
    }
  };

  return { results, run, log };
};
