Bun.$.cwd(import.meta.dir);

const mode = process.argv[2] === 'node' ? 'bun' : 'bun tsx';
for (const path of new Bun.Glob('**/*.ts').scanSync(import.meta.dir + '/src')) {
  console.log('Running', path.slice(0, -8));
  await Bun.$`${{ raw: mode }} src/${path}`;
  console.log('-----------------------------');
}
