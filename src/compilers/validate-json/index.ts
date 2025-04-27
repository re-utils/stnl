import type {
  TType,
  TString,
  TList,
  TObject,
  TTuple,
  TRef,
  TConst,
  TSchema,
  TTaggedUnion,
  InferSchema,
  TBasic,
  TExtendedBasic,
  TFloat,
  TInt,
} from '../../index.js';
import buildSchema from '../build.js';

export const loadObjectProps = (
  schema: TObject,
  id: string,
  refs: Record<string, number>,
): string => {
  let str = '';

  // Required props
  let props = schema.props;
  if (props != null)
    for (const itemKey in props)
      str += `&&${loadSchema(props[itemKey], `${id}.${itemKey}`, refs)}`;

  // Optional props
  props = schema.optionalProps;
  if (props != null)
    for (const itemKey in props)
      str += `&&(typeof ${id}.${itemKey}==='undefined'||${loadSchema(props[itemKey], `${id}.${itemKey}`, refs)})`;

  return str;
};

export const loadLenChecks = (schema: TString | TList, id: string): string =>
  // eslint-disable-next-line
  (typeof schema.maxLen === 'number'
    ? `&&${id}.length<${(schema as TString).maxLen! + 1}`
    : '') +
  (typeof schema.minLen === 'number'
    ? `&&${id}.length>${(schema as TString).minLen! - 1}`
    : '');

export const loadLimitChecks = (schema: TInt | TFloat, id: string): string =>
  (schema.min == null ? '' : `&&${id}>=${schema.min}`) +
  (schema.max == null ? '' : `&&${id}<=${schema.max}`);

export const loadType = (type: TBasic, id: string): string => {
  switch (type.charCodeAt(0)) {
    // Any
    case 97:
      return `typeof ${id}!=='undefined'`;

    // Bool
    case 98:
      return `typeof ${id}==='boolean'`;

    // Float
    case 102:
      return `typeof ${id}==='number'`;

    // Integers
    case 105:
      return `Number.isInteger(${id})`;

    // String
    case 115:
      return `typeof ${id}==='string'`;
  }

  return '';
};

export function loadSchema(
  schema: TType,
  id: string,
  refs: Record<string, number>,
): string {
  if (typeof schema === 'string') return loadType(schema, id);

  let str = schema.nullable === true ? `(${id}===null||` : '';

  loop: for (const key in schema) {
    if (key === 'type') {
      str += loadType((schema as TExtendedBasic).type, id);
      switch ((schema as TExtendedBasic).type.charCodeAt(0)) {
        // Float & int
        case 102:
        case 105:
          str += loadLimitChecks(schema as TFloat, id);
          break loop;

        // String
        case 115:
          str += loadLenChecks(schema as TString, id);
          break loop;
      }
    } else if (key === 'item') {
      str += `Array.isArray(${id})${loadLenChecks(schema as TList, id)}&&${id}.every((o)=>${loadSchema((schema as TList).item, 'o', refs)})`;
      break;
    } else if (key === 'props' || key === 'optionalProps') {
      str += `typeof ${id}==='object'`;
      if (schema.nullable !== true) str += `&&${id}!==null`;

      str += loadObjectProps(schema as TObject, id, refs);
      break;
    } else if (key === 'tag' || key === 'map') {
      str += `typeof ${id}==='object'&&`;
      if (schema.nullable !== true) str += `${id}!==null&&`;

      const tagId = `${id}.${(schema as TTaggedUnion).tag}`;
      str += `typeof ${tagId}==='string'&&`;

      const maps = (schema as TTaggedUnion).map;
      for (const val in maps)
        str += `${tagId}===${JSON.stringify(val)}?true${loadObjectProps(maps[val], id, refs)}:`;

      str += 'false';
      break;
    } else if (key === 'const') {
      // Inline constants
      str += `${id}===${JSON.stringify((schema as TConst).const)}`;
      break;
    } else if (key === 'ref') {
      // Search references
      str += `d${refs[(schema as TRef).ref]}(${id})`;
      break;
    } else if (key === 'values') {
      // Handle tuples
      str += `Array.isArray(${id})&&${id}.length===${(schema as TTuple).values.length}`;

      // Handle tuples
      for (
        let i = 0, schemas = (schema as TTuple).values, l = schemas.length;
        i < l;
        i++
      )
        str += `&&(${loadSchema(schemas[i], `${id}[${i}]`, refs)})`;

      break;
    }
  }

  return schema.nullable === true ? str + ')' : str;
}

const f = (schema: TSchema, id: string, decls: string[]): string => {
  if (schema.defs == null)
    return loadSchema(schema, id, null as unknown as Record<string, number>);

  const refs: Record<string, number> = {};

  const defs = schema.defs;
  const schemas: [TType, number][] = [];

  // Initialize references first
  for (const key in defs)
    schemas.push([defs[key], (refs[key] = decls.push(''))]);

  // Then build the schemas
  for (let i = 0, l = schemas.length; i < l; i++)
    decls[schemas[i][1]] = '(o)=>' + loadSchema(schemas[i][0], 'o', refs);

  return loadSchema(schema, id, refs);
};

export default f;
export const build = <const T extends TSchema>(
  schema: T,
): ((o: any) => o is InferSchema<T>) => buildSchema(schema, f) as any;
