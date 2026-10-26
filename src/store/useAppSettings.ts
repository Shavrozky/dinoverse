import { create } from 'zustand';

export type GraphicsQuality = 'low' | 'medium' | 'high';
export type AppLanguage = 'en' | 'id';
export type AppTheme = 'dark' | 'light';

const STORAGE_KEYS = {
  language: 'dinoverse_language',
  theme: 'dinoverse_theme',
  sound: 'dinoverse_sound',
  quality: 'dinoverse_quality',
} as const;

export function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'en' || value === 'id';
}

export function isAppTheme(value: unknown): value is AppTheme {
  return value === 'dark' || value === 'light';
}

export function isGraphicsQuality(value: unknown): value is GraphicsQuality {
  return value === 'low' || value === 'medium' || value === 'high';
}

function readStorage(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return null;
}

function writeStorage(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage write errors
  }
}

export function syncDocumentPreferences(language: AppLanguage, theme: AppTheme): void {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = language;
    document.documentElement.setAttribute('data-theme', theme);
  }
}

function getInitialLanguage(): AppLanguage {
  const stored = readStorage(STORAGE_KEYS.language);
  return isAppLanguage(stored) ? stored : 'en';
}

function getInitialTheme(): AppTheme {
  const stored = readStorage(STORAGE_KEYS.theme);
  return isAppTheme(stored) ? stored : 'dark';
}

function getInitialSound(): boolean {
  const stored = readStorage(STORAGE_KEYS.sound);
  if (stored === 'false') return false;
  if (stored === 'true') return true;
  return true;
}

function getInitialQuality(): GraphicsQuality {
  const stored = readStorage(STORAGE_KEYS.quality);
  return isGraphicsQuality(stored) ? stored : 'high';
}

export interface AppSettingsState {
  language: AppLanguage;
  theme: AppTheme;
  soundEnabled: boolean;
  graphicsQuality: GraphicsQuality;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  setGraphicsQuality: (quality: GraphicsQuality) => void;
}

const initialLanguage = getInitialLanguage();
const initialTheme = getInitialTheme();

// Apply initial root attributes immediately on module load
syncDocumentPreferences(initialLanguage, initialTheme);

export const useAppSettings = create<AppSettingsState>((set, get) => ({
  language: initialLanguage,
  theme: initialTheme,
  soundEnabled: getInitialSound(),
  graphicsQuality: getInitialQuality(),

  setLanguage: (language) => {
    const validLanguage = isAppLanguage(language) ? language : 'en';
    writeStorage(STORAGE_KEYS.language, validLanguage);
    syncDocumentPreferences(validLanguage, get().theme);
    set({ language: validLanguage });
  },

  toggleLanguage: () => {
    const nextLanguage: AppLanguage = get().language === 'en' ? 'id' : 'en';
    writeStorage(STORAGE_KEYS.language, nextLanguage);
    syncDocumentPreferences(nextLanguage, get().theme);
    set({ language: nextLanguage });
  },

  setTheme: (theme) => {
    const validTheme = isAppTheme(theme) ? theme : 'dark';
    writeStorage(STORAGE_KEYS.theme, validTheme);
    syncDocumentPreferences(get().language, validTheme);
    set({ theme: validTheme });
  },

  toggleTheme: () => {
    const nextTheme: AppTheme = get().theme === 'dark' ? 'light' : 'dark';
    writeStorage(STORAGE_KEYS.theme, nextTheme);
    syncDocumentPreferences(get().language, nextTheme);
    set({ theme: nextTheme });
  },

  toggleSound: () => {
    const nextSound = !get().soundEnabled;
    writeStorage(STORAGE_KEYS.sound, String(nextSound));
    set({ soundEnabled: nextSound });
  },

  setGraphicsQuality: (quality) => {
    const validQuality = isGraphicsQuality(quality) ? quality : 'high';
    writeStorage(STORAGE_KEYS.quality, validQuality);
    set({ graphicsQuality: validQuality });
  },
}));
