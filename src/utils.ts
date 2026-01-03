const UNKNOWN_CHARACTER = /[^A-Za-z0-9_-]/;

export const assertProperty = (name: string): void => {
  if (UNKNOWN_CHARACTER.test(name))
    throw new Error('property `' + name + '` must only includes A-Z, a-z, 0-9, _ and -');
};

/**
 * Get property accessor.
 *
 * @example
 * getAccessor('name'); // '.name'
 * getAccessor('content-type'); // '["content-type"]'
 * getAccessor('&name'); // throws
 */
export const getAccessor = (name: string): string => (
  assertProperty(name), name.includes('-') ? '[' + JSON.stringify(name) + ']' : '.' + name
);

/**
 * Get property to set in object
 *
 * @example
 * getObjectProperty('name'); // 'name'
 * getObjectProperty('content-type'); // '"content-type"'
 * getObjectProperty('&name'); // throws
 */
export const getObjectProperty = (name: string): string => (
  assertProperty(name), name.includes('-') ? JSON.stringify(name) : name
);
