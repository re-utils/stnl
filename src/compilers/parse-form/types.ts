import type {
  InferType,
  TConst,
  TInt,
  TPrimitive,
  TString,
} from '../../index.js';

export type TFile =
  | 'file'
  | {
      type: 'file';
      mime?: Omit<TString | TConst, 'type'>;
      size?: Omit<TInt, 'type'>;
    };
export type TFormValue = TPrimitive | File;
export type TForm = Record<string, TFormValue>;

export type InferFormValue<T extends TFormValue> = T extends TFile
  ? File
  : InferType<T>;

export type InferForm<T extends TForm> = {
  [K in keyof T]: InferFormValue<T[K]>;
};
