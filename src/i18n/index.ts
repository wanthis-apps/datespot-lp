import { ja } from './ja';
import { en } from './en';
import type { AppLanguage, TranslationKey, TranslationVars } from './types';

export const dictionaries = {
  ja,
  en,
} as const;

export type TranslationDict = import('./types').DeepString<typeof ja>;
export type AppTranslationKey = TranslationKey<TranslationDict>;

export { ja } from './ja';
export { en } from './en';
export type { AppLanguage, TranslationVars } from './types';

export const LANGUAGE_OPTIONS: ReadonlyArray<{
  value: AppLanguage;
  labelKey: AppTranslationKey;
}> = [
  { value: 'ja', labelKey: 'language.ja' },
  { value: 'en', labelKey: 'language.en' },
];

function readPath(dictionary: TranslationDict, key: AppTranslationKey): string {
  const parts = key.split('.');
  let current: unknown = dictionary;

  for (const part of parts) {
    if (typeof current !== 'object' || current === null) {
      return key;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : key;
}

export function translate(
  language: AppLanguage,
  key: AppTranslationKey,
  vars?: TranslationVars,
): string {
  const template = readPath(dictionaries[language], key);
  if (vars === undefined) {
    return template;
  }

  return Object.entries(vars).reduce((result, [name, value]) => {
    return result.split(`{${name}}`).join(String(value));
  }, template);
}

export function isAppLanguage(value: string): value is AppLanguage {
  return value === 'ja' || value === 'en';
}
