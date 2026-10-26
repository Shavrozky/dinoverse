import { formatLocalizedPeriod } from '@/i18n/formatters';
import type { AppLanguage } from '@/store/useAppSettings';
import type { GeologicalPeriod } from '@/types';

export interface PeriodInfo {
  id: GeologicalPeriod;
  name: string;
  startMya: number;
  endMya: number;
  description: string;
}

export const geologicalPeriods: PeriodInfo[] = [
  {
    id: 'triassic',
    name: 'Triassic',
    startMya: 252,
    endMya: 201,
    description:
      'The dawn of the Mesozoic Era following the Great Dying extinction event, marked by the supercontinent Pangaea and the rise of early nimble theropods and sauropodomorphs.',
  },
  {
    id: 'jurassic',
    name: 'Jurassic',
    startMya: 201,
    endMya: 145,
    description:
      'The golden age of colossal sauropods, plated stegosaurs, and iconic predatory theropods as Pangaea began rifting apart into lush, humid continents.',
  },
  {
    id: 'cretaceous',
    name: 'Cretaceous',
    startMya: 145,
    endMya: 66,
    description:
      'The final and longest chapter of the Mesozoic Era, witnessing the radiation of flowering plants, horned ceratopsians, duck-billed hadrosaurs, and giant apex tyrannosaurs.',
  },
];

export const PERIOD_LABELS: Record<GeologicalPeriod, string> = {
  triassic: 'Triassic',
  jurassic: 'Jurassic',
  cretaceous: 'Cretaceous',
};

export function getPeriodInfo(period: GeologicalPeriod): PeriodInfo | undefined {
  return geologicalPeriods.find((item) => item.id === period);
}

export function formatPeriodLabel(
  period: GeologicalPeriod,
  stage?: string,
  language: AppLanguage = 'en'
): string {
  return formatLocalizedPeriod(period, stage, language);
}
