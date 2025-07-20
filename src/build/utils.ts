// Optimize direct calls from function
export const optimizeDirectCall = (s: string): string =>
  s === 'o=>Number.isInteger(o)'
    ? 'Number.isInteger'
    : s === 'o=>JSON.stringify(o)'
      ? 'JSON.stringify'
      : /^o=>d\d+\(o\)$/.test(s)
        ? s.slice(3, -3)
        : s;
