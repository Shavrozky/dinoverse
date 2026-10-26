import { useAppSettings, type AppLanguage } from '@/store/useAppSettings';
import { en } from './translations/en';
import { id } from './translations/id';
import type { TranslationDictionary } from './types';

export const translations: Record<AppLanguage, TranslationDictionary> = {
  en,
  id,
};

/**
 * Pure helper to retrieve the translation dictionary for a given language,
 * falling back safely to English.
 */
export function getTranslationDictionary(language: AppLanguage = 'en'): TranslationDictionary {
  return translations[language] ?? translations.en;
}

export interface UseTranslationResult {
  t: TranslationDictionary;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
}

/**
 * React hook returning the active translation dictionary and language controls.
 */
export function useTranslation(): UseTranslationResult {
  const language = useAppSettings((state) => state.language);
  const setLanguage = useAppSettings((state) => state.setLanguage);
  const toggleLanguage = useAppSettings((state) => state.toggleLanguage);

  const t = getTranslationDictionary(language);

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
  };
}
