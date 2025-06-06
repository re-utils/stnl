import { defineCase } from '@utils';
export default defineCase({
  name: 'baseline',
  tests: {
    stringify: JSON.stringify,
  },
});
