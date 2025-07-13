import { format } from "@lib";

Bun.$.cwd(import.meta.dir);

const logRunning = (name: string) => console.log(format.header(name) + ':');

const mode = process.argv[2] === 'node' ? 'bun tsx --no-opt' : 'BUN_JSC_useDFGJIT=0 bun';
console.log(mode);

const target: string | undefined = process.argv[3];

if (target == null)
  for (const path of new Bun.Glob('**/*.ts').scanSync(
    import.meta.dir + '/src',
  )) {
    logRunning(path.slice(0, -8));
    await Bun.$`${{ raw: mode }} src/${path}`;
  }
else {
  logRunning(target);
  await Bun.$`${{ raw: mode }} src/${target}.case.ts`;
}
