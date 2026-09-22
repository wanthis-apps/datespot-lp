import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isAppLanguage,
  translate,
  type AppLanguage,
  type AppTranslationKey,
  type TranslationVars,
} from '@/i18n';
import { showToast } from './toastStore';

const LANGUAGE_STORAGE_KEY = '@datespot/language';

export type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: AppTranslationKey, vars?: TranslationVars) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [language, setLanguageState] = useState<AppLanguage>('ja');

  useEffect(() => {
    void AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((stored) => {
      if (stored !== null && isAppLanguage(stored)) {
        setLanguageState(stored);
      }
    });
  }, []);

  const setLanguage = useCallback((next: AppLanguage): void => {
    setLanguageState(next);
    void AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    showToast({
      message: next === 'ja' ? '言語を日本語に変更しました' : 'Language set to English',
      type: 'success',
    });
  }, []);

  const t = useCallback(
    (key: AppTranslationKey, vars?: TranslationVars): string => {
      return translate(language, key, vars);
    },
    [language],
  );

  const value = useMemo(
    (): LanguageContextValue => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (value === null) {
    throw new Error('useI18n は LanguageProvider の内側で使ってください。');
  }

  return value;
}
