// Optimize direct calls from function
export const optimizeDirectCall = (s: string): string =>
  // String starts with o=>
  s.endsWith('(o)') &&
  (s[3] === 'd' ||
    s.startsWith('Number.isInteger', 3) ||
    s.startsWith('JSON.stringify', 3))
    ? s.slice(3, -3)
    : s;
