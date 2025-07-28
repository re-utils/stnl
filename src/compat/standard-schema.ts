import type { StandardSchemaV1 } from '@standard-schema/spec';

export const v1 = <T>(fn: (o: any) => o is T, errorMessage: string): StandardSchemaV1<any, T> => {
  const error = { issues: [{ message: errorMessage }] };

  return {
    '~standard': {
      version: 1,
      vendor: 'stnl',
      validate: (o) => fn(o) ? { value: o } : error
    }
  }
};
