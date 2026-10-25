import type { FC } from 'react';
import { PERIOD_LABELS } from '@/data/periods';
import {
  DIET_LABELS,
  type DietFilterValue,
  type DinosaurFilterState,
  type PeriodFilterValue,
} from '../../types';
import { formatResultCount } from '../../utils';
import styles from './DinosaurResultCount.module.css';

export interface DinosaurResultCountProps {
  count: number;
  filters: DinosaurFilterState;
  hasActiveFilters: boolean;
  onRemoveSearch: () => void;
  onRemovePeriod: () => void;
  onRemoveDiet: () => void;
  onClearAll: () => void;
}

export const DinosaurResultCount: FC<DinosaurResultCountProps> = ({
  count,
  filters,
  hasActiveFilters,
  onRemoveSearch,
  onRemovePeriod,
  onRemoveDiet,
  onClearAll,
}) => {
  const renderPeriodChip = (period: PeriodFilterValue) => {
    if (period === 'all') return null;
    return (
      <button
        type="button"
        className={styles.chip}
        onClick={onRemovePeriod}
        aria-label={`Remove ${PERIOD_LABELS[period]} period filter`}
      >
        <span>{PERIOD_LABELS[period]}</span>
        <span className={styles.chipRemove} aria-hidden="true">
          ×
        </span>
      </button>
    );
  };

  const renderDietChip = (diet: DietFilterValue) => {
    if (diet === 'all') return null;
    return (
      <button
        type="button"
        className={styles.chip}
        onClick={onRemoveDiet}
        aria-label={`Remove ${DIET_LABELS[diet]} diet filter`}
      >
        <span>{DIET_LABELS[diet]}</span>
        <span className={styles.chipRemove} aria-hidden="true">
          ×
        </span>
      </button>
    );
  };

  const trimmedSearch = filters.search.trim();

  return (
    <div className={styles.resultBar} aria-live="polite">
      <div className={styles.leftGroup}>
        <span className={styles.countText}>{formatResultCount(count)}</span>

        {hasActiveFilters && (
          <div className={styles.activeChips}>
            {trimmedSearch.length > 0 && (
              <button
                type="button"
                className={styles.chip}
                onClick={onRemoveSearch}
                aria-label={`Remove search query "${trimmedSearch}"`}
              >
                <span>&ldquo;{trimmedSearch}&rdquo;</span>
                <span className={styles.chipRemove} aria-hidden="true">
                  ×
                </span>
              </button>
            )}
            {renderPeriodChip(filters.period)}
            {renderDietChip(filters.diet)}
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <button type="button" className={styles.clearAllButton} onClick={onClearAll}>
          Clear filters
        </button>
      )}
    </div>
  );
};
