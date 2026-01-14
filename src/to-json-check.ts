import type { AnySchema, Limit, Schema } from './builder.ts';

let _vars = '';
let _currentId = 0;

export const _compileLimits = (schema: AnySchema, input: string, startIndex: number): string => {
  let str = '';

  while (startIndex < schema.length) {
    str += '&&';

    // @ts-ignore
    const limit: Limit = schema[startIndex++];
    const id: number = limit[0];

    if (id === 1) str += input + '.length<' + (limit[1] + 1);
    else if (id === 2) str += input + '.length>' + (limit[1] - 1);
    else if (id === 3) str += input + '.startsWith(' + JSON.stringify(limit[1]) + ')';
    else if (id === 4) str += input + '<=' + limit[1];
    else if (id === 5) str += input + '>=' + limit[1];
    else if (id === 6) str += input + '<' + limit[1];
    else if (id === 7) str += input + '>' + limit[1];
    else throw new Error('Unknown limit type: ' + id);
  }

  return str;
};

export const _compileObject = (schema: AnySchema, input: string): string => {
  let str = '';
  // @ts-ignore
  const required: Record<string, AnySchema> = schema[1];
  for (const key in required) str += '&&' + _compile(required[key], input + '.' + key);

  if (schema.length > 2) {
    // @ts-ignore
    const optional: Record<string, AnySchema> | undefined = schema[2];
    for (const key in optional) {
      const keyInput = input + '.' + key;
      str += '&&(typeof ' + keyInput + '==="undefined"||' + _compile(optional[key], keyInput) + ')';
    }
  }
  return str;
};

export const _compileScopeToFn = (schema: AnySchema): string => {
  const currentId = _currentId++;

  // Save current scope info and create a subscope
  let prevScope = _vars + ',$' + currentId + ';{let $';
  let loadRefs = '';

  _vars = '';

  // Set current schema as $ in subscope for self-reference
  // Scope output must be lazy functions
  if (schema.length > 2) {
    // @ts-ignore
    const map: Record<string, AnySchema> | undefined = schema[2];
    // Scope output must be lazy functions
    for (const key in map) {
      prevScope += ',' + key;
      loadRefs += ';' + key + '=' + _compileToFn(map[key], false);
    }
  }

  // Root can be compile to expression if set last
  const root = _compileToFn(
    // @ts-ignore
    schema[1],
    false,
  );

  // Reset to previous scope values
  _vars =
    // Load variables
    prevScope +
    _vars +
    loadRefs +
    // Load self
    ';$' +
    currentId +
    '=$=' +
    root +
    '}let $_';
  return ('$' + currentId) as any;
};

// This is a pass to optimize output for inlinable functions
export const _compileToFn = (schema: AnySchema, saveFn: boolean): string => {
  // @ts-ignore
  const id: number = schema[0];

  if (id === 1) {
    if (schema.length === 1) return 'Number.isFinite' as any;
  } else if (id === 2) {
    if (schema.length === 1) return 'Number.isInteger' as any;
  } else if (id === 12) return _compileScopeToFn(schema);

  if (saveFn) {
    const condition = _compile(schema, 'o');
    _vars += ',$' + _currentId + '=o=>' + condition;
    return ('$' + _currentId++) as any;
  }

  return ('o=>' + _compile(schema, 'o')) as any;
};

export const _compile = (schema: AnySchema, input: string): string => {
  // @ts-ignore
  const id: number = schema[0];
  if (id === 0)
    return ('typeof ' + input + '!=="undefined"' + _compileLimits(schema, input, 1)) as any;
  else if (id === 1)
    return ('Number.isFinite(' + input + ')' + _compileLimits(schema, input, 1)) as any;
  else if (id === 2)
    return ('Number.isInteger(' + input + ')' + _compileLimits(schema, input, 1)) as any;
  else if (id === 3) return ('typeof ' + input + '==="boolean"') as any;
  else if (id === 4)
    return ('typeof ' + input + '==="string"' + _compileLimits(schema, input, 1)) as any;
  else if (id === 5)
    // (o===null||...)
    return ('(' +
      input +
      '===null||' +
      _compile(
        // @ts-ignore
        schema[1],
        input,
      ) +
      ')') as any;
  else if (id === 6) {
    // @ts-ignore
    const list: string[] = schema[1];

    // o==="
    input += '==="';
    let str = input + list[0] + '"';

    // &&o==="
    input = '&&' + input;
    // &&o==="key"
    for (let i = 1; i < list.length; i++) str += input + list[i] + '"';
    return str as any;
  } else if (id === 7) {
    // Array.isArray(o)&&o.every($i);
    return ('Array.isArray(' +
      input +
      ')&&' +
      input +
      '.every(' +
      _compileToFn(
        // @ts-ignore
        schema[1],
        true,
      ) +
      ')' +
      _compileLimits(schema, input, 2)) as any;
  } else if (id === 8)
    // typeof o==="object"&&o!==null...
    return ('typeof ' +
      input +
      '==="object"&&' +
      input +
      '!==null' +
      _compileObject(schema, input)) as any;
  else if (id === 9) {
    // @ts-ignore
    const items: AnySchema[] = schema[1];

    // Array.isArray(o)&&o.length===?
    let str = 'Array.isArray(' + input + ')&&' + input + '.length===' + items.length;

    // o[
    input += '[';
    // Array.isArray(o)&&o.length===?&&#check0(o[0])&&#check1(o[1])...
    for (let i = 0; i < items.length; i++) str += '&&' + _compile(schema, input + i + ']');

    return str as any;
  } else if (id === 10) {
    // o.discriminator==="
    const prop: string =
      input +
      '.' +
      // @ts-ignore
      schema[1] +
      '==="';
    // @ts-ignore
    const map: Record<string, Schema<Record<string, AnySchema>, any>> = schema[2];

    // typeof o==='object'&&o!==null&&(
    let str = 'typeof ' + input + '==="object"&&' + input + '!==null&&(';
    for (const key in map)
      // o.discriminator==="key"?true&&limit1&&limit2:
      str += prop + key + '"?true' + _compileObject(map[key], input) + ':';
    return (str + 'false)') as any;
  } else if (id === 11)
    // key(o) or $(o) for self ref
    return (
      // @ts-ignore
      (schema[1] + '(' + input + ')') as any
    );
  else if (id === 12) return (_compileScopeToFn(schema) + '(' + input + ')') as any;
  else return 'false' as any;
};

export const _cleanOutput = (str: string): string => str.replace(/(?:\$_,)|(?:let \$_;)/g, '');

/**
 * Compile a JSON check function from a schema to code
 * @param schema
 */
export const code = <T extends AnySchema>(schema: T, target: string): string => {
  let fn = _compileToFn(schema, false);
  fn =
    (_vars.length === 0 ? '{' : '{' + _cleanOutput('let $_' + _vars + ';')) +
    target +
    '=' +
    fn +
    '}';

  // Reset scope
  _vars = '';
  _currentId = 0;

  return fn;
};

/**
 * Compile a JSON check function from a schema
 * @param schema
 */
export const compile = <T extends AnySchema>(schema: T): ((o: any) => o is T['~type']) => {
  let fn = _compileToFn(schema, false);
  _vars.length > 0 && (fn = _cleanOutput('let $_' + _vars + ';') + fn);

  // Reset scope
  _vars = '';
  _currentId = 0;

  // Indirect eval is a little faster than Function at startup
  return (0, eval)('{' + fn + '}');
};
