import {
  DINOSAUR_DIETS,
  GEOLOGICAL_PERIODS,
  type DinosaurDiet,
  type GeologicalPeriod,
} from '@/types';

export type PeriodFilterValue = GeologicalPeriod | 'all';
export type DietFilterValue = DinosaurDiet | 'all';

export const DINOSAUR_SORT_OPTIONS = [
  'name-asc',
  'name-desc',
  'largest',
  'smallest',
  'oldest',
  'youngest',
] as const;

export type DinosaurSortOption = (typeof DINOSAUR_SORT_OPTIONS)[number];

export const DEFAULT_SORT_OPTION: DinosaurSortOption = 'name-asc';

export interface DinosaurFilterState {
  search: string;
  period: PeriodFilterValue;
  diet: DietFilterValue;
  sort: DinosaurSortOption;
}

export type DinosaurFilterOptions = Partial<DinosaurFilterState>;

export const DEFAULT_DINOSAUR_FILTERS: DinosaurFilterState = {
  search: '',
  period: 'all',
  diet: 'all',
  sort: DEFAULT_SORT_OPTION,
};

export const SORT_OPTION_LABELS: Record<DinosaurSortOption, string> = {
  'name-asc': 'Name A → Z',
  'name-desc': 'Name Z → A',
  largest: 'Largest (Length)',
  smallest: 'Smallest (Length)',
  oldest: 'Oldest Era First',
  youngest: 'Youngest Era First',
};

export const DIET_LABELS: Record<DinosaurDiet, string> = {
  carnivore: 'Carnivore',
  herbivore: 'Herbivore',
  omnivore: 'Omnivore',
  piscivore: 'Piscivore',
};

export function isGeologicalPeriod(value: string | null | undefined): value is GeologicalPeriod {
  if (!value) return false;
  return (GEOLOGICAL_PERIODS as readonly string[]).includes(value);
}

export function isDinosaurDiet(value: string | null | undefined): value is DinosaurDiet {
  if (!value) return false;
  return (DINOSAUR_DIETS as readonly string[]).includes(value);
}

export function isDinosaurSortOption(
  value: string | null | undefined
): value is DinosaurSortOption {
  if (!value) return false;
  return (DINOSAUR_SORT_OPTIONS as readonly string[]).includes(value);
}
