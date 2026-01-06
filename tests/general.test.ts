import { tests, types } from './utils.ts';
import { t, toJSONCheck, toJSONSchema } from 'stnl';
import { describe } from 'bun:test';

describe('simple objects', () => {
  describe('no optional properties', () => {
    const T = t.dict({
      name: t.string.concat([t.minLen(3)]),
      id: t.int.concat([t.min(0)]),
    });
    type T = (typeof T)['~type'];

    types.ExpectTrue<
      types.Equal<
        T,
        {
          name: string;
          id: number;
        }
      >
    >;

    tests.toJSONSchema(
      {
        v7: toJSONSchema.v7(T),
        v2020_12: toJSONSchema.v2020_12(T),
        openapi3: toJSONSchema.openapi3(T),
      },
      {
        v7: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 3,
            },
            id: {
              type: 'integer',
              minimum: 0,
            },
          },
          required: ['name', 'id'],
        },
        v2020_12: 'v7',
        openapi3: 'v7',
      },
    );

    const tJSONCheck = toJSONCheck.compile(T);
    types.ExpectTrue<types.Equal<T, types.ReturnGuard<typeof tJSONCheck>>>;
    tests.toJSONCheck(tJSONCheck, {
      truthy: {
        'exact match': {
          name: 'reve',
          id: 0,
        },
      },
      falsy: {
        'missing name': {
          id: 1,
        },
        'missing id': {
          name: 'reve',
        },
        'missing all': {},
        'wrong name': {
          name: 're',
          id: 2,
        },
        'wrong id': {
          name: 'reve',
          id: -1,
        },
        'wrong type': 'string',
      },
    });
  });

  describe('with optional properties', () => {
    const T = t.dict(
      {
        name: t.string.concat([t.minLen(3)]),
        id: t.int.concat([t.min(0)]),
      },
      {
        displayName: t.string,
      },
    );
    type T = (typeof T)['~type'];

    types.ExpectTrue<
      types.Equal<
        T,
        {
          name: string;
          id: number;
          displayName?: string;
        }
      >
    >;

    tests.toJSONSchema(
      {
        v7: toJSONSchema.v7(T),
        v2020_12: toJSONSchema.v2020_12(T),
        openapi3: toJSONSchema.openapi3(T),
      },
      {
        v7: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 3,
            },
            id: {
              type: 'integer',
              minimum: 0,
            },
            displayName: {
              type: 'string',
            },
          },
          required: ['name', 'id'],
        },
        v2020_12: 'v7',
        openapi3: 'v7',
      },
    );

    const tJSONCheck = toJSONCheck.compile(T);
    types.ExpectTrue<types.Equal<T, types.ReturnGuard<typeof tJSONCheck>>>;
    tests.toJSONCheck(tJSONCheck, {
      truthy: {
        'exact match': {
          name: 'reve',
          id: 0,
          displayName: 'reve',
        },
        'missing displayName': {
          name: 'reve',
          id: 0,
        },
      },
      falsy: {
        'missing name': {
          id: 1,
          displayName: 'reve',
        },
        'missing id': {
          name: 'reve',
          displayName: 'reve',
        },
        'missing all': {},
        'wrong name': {
          name: 're',
          id: 2,
          displayName: 'reve',
        },
        'wrong id': {
          name: 'reve',
          id: -1,
          displayName: 'reve',
        },
        'wrong type': 'string',
      },
    });
  });
});
