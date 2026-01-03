import { tests, types } from './utils.ts';
import { t, toJSONCheck } from 'stnl';
import { describe } from 'bun:test';

describe('simple objects', () => {
  describe('no optional properties', () => {
    const T = t.dict({
      name: t.string.concat([t.minLen(3)]),
      id: t.int.concat([t.min(0)]),
    });
    type T = (typeof T)['~type'];
    const tJSONCheck = toJSONCheck.compile(T);

    types.ExpectTrue<types.Equal<T, types.ReturnGuard<typeof tJSONCheck>>>;
    types.ExpectTrue<
      types.Equal<
        T,
        {
          name: string;
          id: number;
        }
      >
    >;

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
    const tJSONCheck = toJSONCheck.compile(T);

    types.ExpectTrue<types.Equal<T, types.ReturnGuard<typeof tJSONCheck>>>;
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
