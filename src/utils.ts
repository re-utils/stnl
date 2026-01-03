const UNKNOWN_CHARACTER = /[^A-Za-z0-9_-]/;

/**
 * Get property accessor.
 *
 * @example
 * getAccessor('name'); // '.name'
 * getAccessor('content-type'); // '["content-type"]'
 * getAccessor('&name'); // throws
 */
export const getAccessor = (name: string): string => {
  if (UNKNOWN_CHARACTER.test(name))
    throw new Error('property `' + name + '` must only includes A-Z, a-z, 0-9, _ and -');

  return name.includes('-') ? '[' + JSON.stringify(name) + ']' : '.' + name;
};
