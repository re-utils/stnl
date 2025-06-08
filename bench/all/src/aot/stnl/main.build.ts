import * as schemas from './schemas.js';

const ROOT = import.meta.dir + '/.out/';

const chunks = [];

for (const name in schemas) {
  const schema = schemas[name as keyof typeof schemas];
  chunks.push(`${name}:()=>{${schema}}`);
}

Bun.write(ROOT + 'index.js', `export default{\n${chunks.join(',\n')}\n}`);
Bun.write(
  ROOT + 'index.d.ts',
  'declare const _:Dict<() => (a: any) => any>;\nexport default _',
);
