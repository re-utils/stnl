Bun.$.cwd(import.meta.dir);
const logEnd = () => console.log('-------------------------------------------');

const mode = process.argv[2] === 'node' ? 'bun tsx' : 'bun';
console.log('* Mode:', mode);
logEnd();

const target: string | undefined = process.argv[3];

if (target == null)
  for (const path of new Bun.Glob('**/*.ts').scanSync(import.meta.dir + '/src')) {
    console.log('- Running', "'" + path.slice(0, -8) + "'" );
    await Bun.$`${{ raw: mode }} src/${path}`;
    logEnd();
  }
else {
  console.log('- Running', "'" + target + "'");
  await Bun.$`${{ raw: mode }} src/${target}.case.ts`;
  logEnd();
}
