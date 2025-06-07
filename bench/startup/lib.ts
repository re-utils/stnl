import { measure, do_not_optimize } from 'mitata';

const UNIT_MAP = ['ns', 'us', 'ms', 's'];
const SAMPLES = 10;

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
    const baseline = results[0].ns;

    for (let i = 0; i < results.length; i++) {
      const res = results[i].ns;
      const args: any[] = ['+ ' + results[i].name + ':'];

      {
        let converted = res;
        let unit = 0;
        while (converted > 1e3 && unit < UNIT_MAP.length) {
          unit++;
          converted /= 1e3;
        };
        args.push(+converted.toFixed(2) + UNIT_MAP[unit]);
      }

      if (i !== 0) args.push('-', +(res / baseline).toFixed(2) + 'x', 'slower');
      console.log(...args);
    }
  };

  return { results, run, log };
};
