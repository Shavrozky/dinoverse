import type { DinosaurSortOption } from '@/features/dinosaurs/types/dinosaurFilters';
import type { AppLanguage } from '@/store/useAppSettings';
import type { Dinosaur, DinosaurDiet, GeologicalPeriod } from '@/types';
import { dinosaurTranslationsId } from './translations/dinosaurs.id';
import type { LocalizedDinosaurText } from './types';

const PERIOD_NAMES: Record<AppLanguage, Record<GeologicalPeriod, string>> = {
  en: {
    triassic: 'Triassic',
    jurassic: 'Jurassic',
    cretaceous: 'Cretaceous',
  },
  id: {
    triassic: 'Trias',
    jurassic: 'Jura',
    cretaceous: 'Kapur',
  },
};

const STAGE_NAMES_ID: Record<string, string> = {
  early: 'Awal',
  middle: 'Tengah',
  late: 'Akhir',
};

const DIET_NAMES: Record<AppLanguage, Record<DinosaurDiet, string>> = {
  en: {
    carnivore: 'Carnivore',
    herbivore: 'Herbivore',
    omnivore: 'Omnivore',
    piscivore: 'Piscivore',
  },
  id: {
    carnivore: 'Karnivora',
    herbivore: 'Herbivora',
    omnivore: 'Omnivora',
    piscivore: 'Piscivora',
  },
};

const SORT_LABELS: Record<AppLanguage, Record<DinosaurSortOption, string>> = {
  en: {
    'name-asc': 'Name A → Z',
    'name-desc': 'Name Z → A',
    largest: 'Largest (Length)',
    smallest: 'Smallest (Length)',
    oldest: 'Oldest Era First',
    youngest: 'Youngest Era First',
  },
  id: {
    'name-asc': 'Nama A → Z',
    'name-desc': 'Nama Z → A',
    largest: 'Terbesar (Panjang)',
    smallest: 'Terkecil (Panjang)',
    oldest: 'Era Tertua Lebih Dulu',
    youngest: 'Era Termuda Lebih Dulu',
  },
};

const LOCATION_NAMES_ID: Record<string, string> = {
  'North America': 'Amerika Utara',
  'South America': 'Amerika Selatan',
  'North Africa': 'Afrika Utara',
  'United States': 'Amerika Serikat',
  Europe: 'Eropa',
  Asia: 'Asia',
};

/**
 * Formats a geological period and optional stage in English or Indonesian.
 * Example: ('cretaceous', 'Late', 'id') -> 'Kapur Akhir'
 */
export function formatLocalizedPeriod(
  period: GeologicalPeriod,
  stage?: string,
  language: AppLanguage = 'en'
): string {
  const periodName = PERIOD_NAMES[language]?.[period] ?? PERIOD_NAMES.en[period];
  if (!stage) {
    return periodName;
  }

  if (language === 'id') {
    const localizedStage = STAGE_NAMES_ID[stage.trim().toLowerCase()] ?? stage;
    return `${periodName} ${localizedStage}`;
  }

  return `${stage} ${periodName}`;
}

/**
 * Formats a dinosaur diet label in English or Indonesian.
 */
export function formatLocalizedDiet(diet: DinosaurDiet, language: AppLanguage = 'en'): string {
  return DIET_NAMES[language]?.[diet] ?? DIET_NAMES.en[diet];
}

/**
 * Formats a catalog sort option label in English or Indonesian.
 */
export function formatLocalizedSortOption(
  option: DinosaurSortOption,
  language: AppLanguage = 'en'
): string {
  return SORT_LABELS[language]?.[option] ?? SORT_LABELS.en[option];
}

/**
 * Formats geographic region names while keeping internationally recognizable proper names.
 */
export function formatLocalizedLocations(
  locations: readonly string[],
  language: AppLanguage = 'en'
): string[] {
  if (language === 'id') {
    return locations.map((loc) => LOCATION_NAMES_ID[loc] ?? loc);
  }
  return [...locations];
}

/**
 * Resolves localized descriptive text for a dinosaur without duplicating canonical data.
 * Automatically falls back to English if an Indonesian entry is missing.
 */
export function getLocalizedDinosaurContent(
  dinosaur: Dinosaur,
  language: AppLanguage = 'en'
): LocalizedDinosaurText & { locations: string[] } {
  const localizedLocations = formatLocalizedLocations(dinosaur.locations, language);

  if (language === 'id') {
    const entry = dinosaurTranslationsId[dinosaur.slug];
    if (entry) {
      return {
        meaning: entry.meaning || dinosaur.meaning || '',
        shortDescription: entry.shortDescription || dinosaur.shortDescription,
        description: entry.description || dinosaur.description,
        locations: localizedLocations,
      };
    }
  }

  return {
    meaning: dinosaur.meaning ?? '',
    shortDescription: dinosaur.shortDescription,
    description: dinosaur.description,
    locations: localizedLocations,
  };
}
