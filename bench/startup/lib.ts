import { measure, do_not_optimize } from 'mitata';

const UNIT_MAP = {
  ns: 1,
  us: 1e3,
  ms: 1e6
}

const SAMPLES = 5;
const UNIT: keyof typeof UNIT_MAP = 'ms';

export const defineTest = () => {
  const results: { name: string; ns: number }[] = [];

  const run = async (name: string, f: () => any) => {
    // No optimization
    const res = await measure(() => do_not_optimize(f()), {
      max_samples: SAMPLES,
      min_samples: SAMPLES,
      inner_gc: true,
    });
    results.push({
      name,
      ns: res.avg,
    });
  };

  const log = () => {
    const baseline = results[0].ns;

    for (let i = 0; i < results.length; i++) {
      const res = results[i].ns;

      const args = [results[i].name + ':', +(res / UNIT_MAP[UNIT]).toFixed(2), UNIT];
      if (i !== 0) args.push('-', (res / baseline).toFixed(2) + 'x', 'slower');
      console.log(...args);
    }
  };

  return { results, run, log };
};
