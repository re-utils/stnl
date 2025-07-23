export interface Tests {
  // Support validators that throws or return boolean
  assertLoose: () => (o: any) => boolean | void;
  stringify: () => (o: any) => string;
}

export interface Case {
  name: string;
  url: string;
  tests: Partial<Tests>;
}

export const defineCase = <const T extends Case>(t: T) => t;
export const ROOT = import.meta.dir;
export const TSCONFIG = ROOT + '/tsconfig.json';
