import { tests, types } from './utils.ts';
import { t, toHeadersParser } from 'stnl';
import { describe } from 'bun:test';

describe('request headers', () => {
  describe('no optional properties', () => {
    const T = t.dict({
      authorization: t.string,
      'content-type': t.string,
      'x-fast-check': t.bool,
    });
    const tHeadersParser = toHeadersParser.compile(T);

    types.ExpectTrue<
      types.Equal<
        ReturnType<typeof tHeadersParser>,
        {
          authorization: string;
          content_type: string;
          x_fast_check: boolean;
        } | null
      >
    >;

    tests.toHeadersParser(tHeadersParser, {
      truthy: {
        'exact match': {
          authorization: 'bearer sometoken',
          'content-type': 'application/json',
          'x-fast-check': '',
        },
      },
      falsy: {},
    });
  });
});
