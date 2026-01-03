export const PROPERTY_REGEX: RegExp = /^[A-Za-z][A-Za-z0-9_]*$/;
export const assertProperty = (name: string): void => {
  if (!PROPERTY_REGEX.test(name))
    throw new Error('property `' + name + '` must only includes letters, digits and _');
};

export const HEADER_REGEX: RegExp = /^[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9]$/;
export const assertHeader = (name: string): void => {
  if (!HEADER_REGEX.test(name))
    throw new Error('header `' + name + '` must only includes letters, digits and hyphen (`-`)');
};
