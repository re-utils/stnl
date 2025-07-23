import { build, type OutputChunk } from 'rolldown';

const OUTPUT_DIR = import.meta.dir + '/.startup/';
const BUNDLED_DIR = OUTPUT_DIR + 'bundled/';
const SRC = import.meta.dir + '/src/';

const files = Array.from(
  new Bun.Glob('**/*.case.ts').scanSync({
    cwd: SRC,
    absolute: true,
  }),
);

const buildOutput = (
  await build({
    input: files,
    resolve: {
      tsconfigFilename: import.meta.dir + '/tsconfig.json',
    },
    output: {
      dir: BUNDLED_DIR,
      minify: {
        compress: false,
        removeWhitespace: true,
        mangle: true,
      },
    },
  })
).output
  .filter((o) => o.type === 'chunk' && o.facadeModuleId)
  .map((o: any) => {
    o = o as OutputChunk;
    let name = o.facadeModuleId!.slice(SRC.length);

    const bundled = BUNDLED_DIR + o.fileName;

    name = name.slice(0, -'.case.ts'.length);
    if (name.endsWith('/index')) name = name.slice(0, -'/index'.length);

    return {
      name,
      bundled,
      size: {
        minified: Buffer.from(o.code).byteLength,
        gzipped: Bun.gzipSync(o.code).byteLength,
      },
    };
  });

await Bun.write(
  OUTPUT_DIR + '_.js',
  `const n = (() => {
  try {
    Bun.nanoseconds();
    return Bun.nanoseconds;
  } catch {}
  try {
    $.agent.monotonicNow();
    return () => 1e6 * $.agent.monotonicNow();
  } catch {}
  try {
    $262.agent.monotonicNow();
    return () => 1e6 * $262.agent.monotonicNow();
  } catch {}
  try {
    const now = performance.now.bind(performance);
    now(); return () => 1e6 * now();
  } catch { return () => 1e6 * Date.now(); }
})();
const gc = (() => {
  try { return (Bun.gc(true), () => Bun.gc(true)); } catch { }
  try { return (globalThis.gc(), () => globalThis.gc()); } catch { }
  try { return (globalThis.__gc(), () => globalThis.__gc()); } catch { }
  try { return (globalThis.std.gc(), () => globalThis.std.gc()); } catch { }
  try { return (globalThis.$262.gc(), () => globalThis.$262.gc()); } catch { }
  try { return (globalThis.tjs.engine.gc.run(), () => globalThis.tjs.engine.gc.run()); } catch { }
  return Object.assign(globalThis.Graal ? () => new Uint8Array(2 ** 29) : () => new Uint8Array(2 ** 30), { fallback: true });
})();
for (let i = 0; i < 100; i++) n();

const results = [];
let s, e;
${buildOutput
  .map(
    (o) => `gc();
s = n();
await import(${JSON.stringify(o.bundled)});
e = n();
results.push({
  name: ${JSON.stringify(o.name)},
  ns: e - s,
  size: {
    minified: ${o.size.minified},
    gzipped: ${o.size.gzipped}
  }
});`,
  )
  .join('\n')}
export default results;`,
);

await Bun.write(
  OUTPUT_DIR + '_.d.ts',
  `declare const results: {
  name: string,
  ns: number,
  size: {
    minified: number,
    gzipped: number
  }
}[];
export default results;`,
);
