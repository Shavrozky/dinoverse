import type { FC } from 'react';
import { PERIOD_LABELS } from '@/data/periods';
import type { DinosaurDiet, GeologicalPeriod } from '@/types';
import { DIET_LABELS, type DietFilterValue, type PeriodFilterValue } from '../../types';
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
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup} role="group" aria-label="Filter by geological period">
        <span className={styles.groupLabel}>Period</span>
        <div className={styles.pillList}>
          <button
            type="button"
            className={`${styles.pillButton} ${selectedPeriod === 'all' ? styles.pillButtonActive : ''}`}
            aria-pressed={selectedPeriod === 'all'}
            onClick={() => onPeriodChange('all')}
          >
            All
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
                {PERIOD_LABELS[period]}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.filterGroup} role="group" aria-label="Filter by diet">
        <span className={styles.groupLabel}>Diet</span>
        <div className={styles.pillList}>
          <button
            type="button"
            className={`${styles.pillButton} ${selectedDiet === 'all' ? styles.pillButtonActive : ''}`}
            aria-pressed={selectedDiet === 'all'}
            onClick={() => onDietChange('all')}
          >
            All
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
                {DIET_LABELS[diet]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
