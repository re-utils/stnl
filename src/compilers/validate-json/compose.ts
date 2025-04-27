import type {
  TType,
  TString,
  TList,
  TObject,
  TTuple,
  TConst,
  TSchema,
  InferSchema,
  TTaggedUnion,
  TExtendedBasic,
  TFloat,
  TInt,
  TRef,
} from '../../index.js';

type Fn = (o: any) => boolean;
type Refs = Record<string, Fn>;

const isBool: Fn = (o) => typeof o === 'boolean';
const isFloat: Fn = (o) => typeof o === 'number';
const isAny: Fn = (o) => typeof o !== 'undefined';
const isString: Fn = (o) => typeof o === 'string';

const isInt = new Map<string, Fn>();

export const loadPropCheck = (
  props: Record<string, TType> | undefined,
  refs: Refs,
): [string[], Fn[]] =>
  props == null
    ? [[], []]
    : [
        Object.keys(props),
        Object.values(props).map((v) => loadSchema(v, refs)),
      ];

export function loadSchema(schema: TType, refs: Refs): Fn {
  if (typeof schema === 'string') {
    switch (schema.charCodeAt(0)) {
      // Any
      case 97:
        return isAny;

      // Bool
      case 98:
        return isBool;

      // Float
      case 102:
        return isFloat;

      // Signed integers
      case 105:
        return Number.isInteger;

      // String
      case 115:
        return isString;
    }

    return isAny;
  }

  const fn = loadSchemaWithoutNullable(schema, refs);
  return schema.nullable === true ? (o) => o === null || fn(o) : fn;
}

export function loadSchemaWithoutNullable(
  schema: Exclude<TType, string>,
  refs: Refs,
): Fn {
  for (const key in schema) {
    if (key === 'type') {
      switch ((schema as TExtendedBasic).type.charCodeAt(0)) {
        // Float
        case 102: {
          const min = (schema as TFloat).min ?? Number.NEGATIVE_INFINITY;
          const max = (schema as TFloat).max ?? Number.POSITIVE_INFINITY;

          return (o) => typeof o === 'number' && o >= min && o <= max;
        }

        // Signed integers
        case 105: {
          const min = (schema as TInt).min ?? Number.NEGATIVE_INFINITY;
          const max = (schema as TInt).max ?? Number.POSITIVE_INFINITY;

          return (o) => Number.isInteger(o) && o >= min && o <= max;
        }

        // String
        case 115: {
          const maxLen =
            ((schema as TString).maxLen ?? Number.POSITIVE_INFINITY) + 1;
          const minLen = ((schema as TString).minLen ?? 0) - 1;

          return (o) =>
            typeof o === 'string' && o.length > minLen && o.length < maxLen;
        }
      }

      throw new Error('Invalid schema');
    }

    if (key === 'item') {
      const items = loadSchema((schema as TList).item, refs);
      const max = ((schema as TList).maxLen ?? Number.POSITIVE_INFINITY) + 1;
      const min = ((schema as TList).minLen ?? 0) - 1;

      return (o) =>
        Array.isArray(o) && o.length > min && o.length < max && o.every(items);
    }

    if (key === 'props' || key === 'optionalProps') {
      // Required props
      const [propsKey, propsVal] = loadPropCheck(
        (schema as TObject).props,
        refs,
      );
      const [optionalPropsKey, optionalPropsVal] = loadPropCheck(
        (schema as TObject).optionalProps,
        refs,
      );

      // Very likely to happen
      const noOptionalProps = optionalPropsKey.length === 0;

      return (o) => {
        if (typeof o !== 'object' || o === null) return false;

        for (let i = 0; i < propsKey.length; i++) {
          // eslint-disable-next-line
          if (!propsVal[i](o[propsKey[i]])) return false;
        }

        if (noOptionalProps) return true;

        for (let i = 0, tmp: any; i < optionalPropsKey.length; i++) {
          // eslint-disable-next-line
          tmp = o[optionalPropsKey[i]];
          if (typeof tmp !== 'undefined' && !optionalPropsVal[i](tmp))
            return false;
        }

        return true;
      };
    }

    if (key === 'tag' || key === 'map') {
      const tag = (schema as TTaggedUnion).tag;
      const maps = new Map(
        Object.entries((schema as TTaggedUnion).map).map(
          (tagVal) =>
            [
              tagVal[0],
              [
                loadPropCheck(tagVal[1].props, refs),
                loadPropCheck(tagVal[1].optionalProps, refs),
              ] as const,
            ] as const,
        ),
      );

      return (o) => {
        // eslint-disable-next-line
        if (typeof o !== 'object' || o === null || typeof o[tag] !== 'string')
          return false;

        // eslint-disable-next-line
        const lists = maps.get(o[tag]);
        if (typeof lists === 'undefined') return false;

        let keys = lists[0][0];
        let vals: Fn[];

        if (keys.length !== 0) {
          vals = lists[0][1];

          for (let i = 0; i < keys.length; i++) {
            // eslint-disable-next-line
            if (!vals[i](o[keys[i]])) return false;
          }
        }

        keys = lists[1][0];

        if (keys.length !== 0) {
          vals = lists[1][1];

          for (let i = 0, tmp: any; i < keys.length; i++) {
            // eslint-disable-next-line
            tmp = o[keys[i]];
            if (typeof tmp !== 'undefined' && !vals[i](tmp)) return false;
          }
        }

        return true;
      };
    }

    if (key === 'const') {
      const c = (schema as TConst).const;
      return (o) => o === c;
    }

    if (key === 'ref') {
      // Lazy loading
      let fn: Fn | undefined;
      return (o) => (fn ??= refs[(schema as TRef).ref])(o);
    }

    if (key === 'values') {
      const len = (schema as TTuple).values.length;
      const values = (schema as TTuple).values.map((val) =>
        loadSchema(val, refs),
      );

      return (o) => {
        if (!Array.isArray(o) || o.length !== len) return false;

        for (let i = 0; i < len; i++) {
          if (!values[i](o[i])) return false;
        }

        return true;
      };
    }
  }

  throw new Error('Invalid schema');
}

export default <const T extends TSchema>(
  schema: T,
): ((o: any) => o is InferSchema<T>) => {
  if (schema.defs == null)
    return loadSchema(schema, null as unknown as Refs) as any;

  const refs: Refs = {};

  const defs = schema.defs;
  for (const key in defs) refs[key] = null as any as Fn;
  for (const key in defs) refs[key] = loadSchema(defs[key], refs);

  return loadSchema(schema, refs) as any;
};
