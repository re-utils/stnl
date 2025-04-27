import type { InferSchema } from '../../src/index.js';
import type { Equal, Expect } from './types.js';

type Output = InferSchema<{
  defs: {
    link: {
      props: {
        id: 'float';
        items: {
          item: { ref: 'link' };
        };
      };
    };
  };

  ref: 'link';
}>;

interface Expected {
  id: number;
  items: Expected[];
}

export type T = Expect<Equal<Output, Expected>>;
