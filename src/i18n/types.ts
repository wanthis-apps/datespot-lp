export type AppLanguage = 'ja' | 'en';

export type DeepString<T> = T extends object
  ? { [K in keyof T]: DeepString<T[K]> }
  : string;

export type TranslationVars = Record<string, string | number>;

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

export type TranslationKey<T> = NestedKeyOf<T>;
