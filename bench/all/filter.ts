import type { Tests } from './utils.js';

export const excludeCase = (name: string) => false;
export const includeCase = (name: string) => true;

export const excludeStartupCase = (name: string) =>
  name.endsWith(' - aot') || name === 'baseline';
export const includeStartupCase = (name: string) => true;

export const excludeTest = (name: keyof Tests) => false;
export const includeTest = (name: keyof Tests) => true;
