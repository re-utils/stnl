import { measure, do_not_optimize } from 'mitata';

const UNIT_MAP = ['ns', 'us', 'ms', 's'];
const SAMPLES = 10;

const round = (n: number) => +n.toFixed(2);
const wrapString = (n: string) => "'" + n + "'";

export const defineTest = () => {
  const results: { name: string; ns: number }[] = [];

  const run = async (name: string, f: () => any) => {
    // No optimization
    const res = await measure(() => do_not_optimize(f()), {
      max_samples: SAMPLES,
      min_samples: SAMPLES,
      warmup_samples: 0,
      inner_gc: true,
    });
    results.push({
      name,
      ns: res.avg,
    });
  };

  const log = () => {
    results.sort((a, b) => a.ns - b.ns);
    const baseline = results[0].ns;

    for (let i = 0; i < results.length; i++) {
      const res = results[i].ns;
      const args: any[] = [(i + 1) + '. ' + wrapString(results[i].name) + ':'];

      {
        let converted = res;
        let unit = 0;
        while (converted > 1e3 && unit < UNIT_MAP.length) {
          unit++;
          converted /= 1e3;
        }
        args.push(round(converted) + UNIT_MAP[unit]);
      }

      if (i !== 0) args.push('---', round(res / baseline) + 'x', 'slower');
      console.log(...args);
    }
  };

  const compare = (s0: string, s1: string) => {
    const r0 = results.find((e) => e.name === s0);
    const r1 = results.find((e) => e.name === s1);

    if (r0 == null || r1 == null) return;

    s0 = wrapString(s0);
    s1 = wrapString(s1);

    if (r0.ns > r1.ns)
      console.log('(+)', s1, 'is', round(r0.ns / r1.ns) + 'x', 'faster than', s0);
    else if (r0.ns === r1.ns)
      console.log('(+)', s1, 'has equal performance to', s0);
    else
      console.log('(+)', s0, 'is', round(r1.ns / r0.ns) + 'x', 'faster than', s1);
  }

  return { results, run, log, compare };
};
