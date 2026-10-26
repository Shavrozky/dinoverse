import type { FC } from 'react';
import { formatLocalizedDiet, formatLocalizedPeriod, useTranslation } from '@/i18n';
import type { DinosaurDiet, GeologicalPeriod } from '@/types';
import type { DietFilterValue, PeriodFilterValue } from '../../types';
import styles from './DinosaurFilters.module.css';

export interface DinosaurFiltersProps {
  selectedPeriod: PeriodFilterValue;
  selectedDiet: DietFilterValue;
  availablePeriods: readonly GeologicalPeriod[];
  availableDiets: readonly DinosaurDiet[];
  onPeriodChange: (period: PeriodFilterValue) => void;
  onDietChange: (diet: DietFilterValue) => void;
}

export const DinosaurFilters: FC<DinosaurFiltersProps> = ({
  selectedPeriod,
  selectedDiet,
  availablePeriods,
  availableDiets,
  onPeriodChange,
  onDietChange,
}) => {
  const { t, language } = useTranslation();

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup} role="group" aria-label={t.explore.periodFilterGroupAria}>
        <span className={styles.groupLabel}>{t.explore.periodLabel}</span>
        <div className={styles.pillList}>
          <button
            type="button"
            className={`${styles.pillButton} ${selectedPeriod === 'all' ? styles.pillButtonActive : ''}`}
            aria-pressed={selectedPeriod === 'all'}
            onClick={() => onPeriodChange('all')}
          >
            {t.explore.allOption}
          </button>
          {availablePeriods.map((period) => {
            const isActive = selectedPeriod === period;
            return (
              <button
                key={period}
                type="button"
                className={`${styles.pillButton} ${isActive ? styles.pillButtonActive : ''}`}
                aria-pressed={isActive}
                onClick={() => onPeriodChange(period)}
              >
                {formatLocalizedPeriod(period, undefined, language)}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.filterGroup} role="group" aria-label={t.explore.dietFilterGroupAria}>
        <span className={styles.groupLabel}>{t.explore.dietLabel}</span>
        <div className={styles.pillList}>
          <button
            type="button"
            className={`${styles.pillButton} ${selectedDiet === 'all' ? styles.pillButtonActive : ''}`}
            aria-pressed={selectedDiet === 'all'}
            onClick={() => onDietChange('all')}
          >
            {t.explore.allOption}
          </button>
          {availableDiets.map((diet) => {
            const isActive = selectedDiet === diet;
            return (
              <button
                key={diet}
                type="button"
                className={`${styles.pillButton} ${isActive ? styles.pillButtonActive : ''}`}
                aria-pressed={isActive}
                onClick={() => onDietChange(diet)}
              >
                {formatLocalizedDiet(diet, language)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
