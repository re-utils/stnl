import { defineCase } from '@utils';
export default defineCase({
  name: 'baseline',
  tests: {
    assertLoose: () => (o) =>
        o !== null &&
        typeof o === 'object' &&
        typeof o.number === 'number' &&
        typeof o.negNumber === 'number' &&
        typeof o.maxNumber === 'number' &&
        typeof o.string === 'string' &&
        typeof o.longString === 'string' &&
        typeof o.boolean === 'boolean' &&
        o.deeplyNested !== null &&
        typeof o.deeplyNested === 'object' &&
        typeof o.deeplyNested.foo === 'string' &&
        typeof o.deeplyNested.num === 'number' &&
        typeof o.deeplyNested.bool === 'boolean' &&
        Array.isArray(o.items) &&
        o.items.every((_: any) => typeof _ === 'number'),
    stringify: () => JSON.stringify,
  },
});
