import { tests, types } from './utils.ts';
import { t } from 'stnl';
import { describe } from 'bun:test';

describe('simple objects', () => {
  describe('no optional properties', () => {
    const schema = t.dict({
      name: t.string.concat([t.minLen(3)]),
      id: t.int.concat([t.min(0)]),
    });

    types.ExpectTrue<
      types.Equal<
        (typeof schema)['~type'],
        {
          name: string;
          id: number;
        }
      >
    >;

    tests.toJSONAssert(schema, {
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
    const schema = t.dict(
      {
        name: t.string.concat([t.minLen(3)]),
        id: t.int.concat([t.min(0)]),
      },
      {
        displayName: t.string,
      },
    );

    types.ExpectTrue<
      types.Equal<
        (typeof schema)['~type'],
        {
          name: string;
          id: number;
          displayName?: string;
        }
      >
    >;

    tests.toJSONAssert(schema, {
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
