import allResults from './.startup/_.js';
import pc from 'picocolors';

const createUnitFormat = (units: string[], sep: number) => (n: number) => {
  let i = 0;
  while (n >= sep && i < units.length - 1) {
    i++;
    n /= sep;
  }
  return pc.yellowBright(n.toFixed(2) + units[i]);
};

const format = {
  time: createUnitFormat(['ns', 'us', 'ms', 's'], 1000),
  byte: createUnitFormat(['b', 'kb', 'mb'], 1000),
  name: (name: string) => pc.bold(pc.cyan(name)),
  multiplier: (x: number) => pc.greenBright(x.toFixed(2) + 'x'),
  header: pc.bold,
  success: pc.greenBright,
  error: pc.redBright,
};

// Sort categories
const categories: Record<string, typeof allResults> = {};
for (const result of allResults) {
  const names = result.name.split('/');
  (categories[names.slice(0, -1).join('/')] ??= []).push({
    ...result,
    name: names[names.length - 1],
  });
}

const printResults = (props: {
  category: string;
  label: string;
  getter: (t: (typeof allResults)[number]) => number;
  formatter: (typeof format)[keyof typeof format];
  diff: string;
}) => {
  console.log(format.header(props.category) + ':', props.label);
  const results = categories[props.category].toSorted(
    (a, b) => props.getter(a) - props.getter(b),
  );
  const baseline = props.getter(results[0]);

  for (let i = 0; i < results.length; i++) {
    const res = props.getter(results[i]);
    console.log(
      `  ${format.name(results[i].name)}: ${props.formatter(
        res as any as never,
      )}${
        i === 0 ? '' : ` - ${format.multiplier(res / baseline)} ${props.diff}`
      }`,
    );
  }
};

// Print results
for (const category in categories) {
  printResults({
    category,
    label: 'startup time',
    getter: (o) => o.ns,
    formatter: format.time,
    diff: 'slower',
  });

  printResults({
    category,
    label: 'minified size',
    getter: (o) => o.size.minified,
    formatter: format.byte,
    diff: 'bigger',
  });

  printResults({
    category,
    label: 'gzipped size',
    getter: (o) => o.size.gzipped,
    formatter: format.byte,
    diff: 'bigger',
  });
}
