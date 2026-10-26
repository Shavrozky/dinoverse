import type { en } from './translations/en';

export type TranslationDictionary = typeof en;

export interface LocalizedDinosaurText {
  meaning: string;
  shortDescription: string;
  description: string;
}
