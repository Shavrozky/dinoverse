import type { FC } from 'react';
import { formatLocalizedDiet, formatLocalizedPeriod, useTranslation } from '@/i18n';
import type { DietFilterValue, DinosaurFilterState, PeriodFilterValue } from '../../types';
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
  const { t, language } = useTranslation();

  const renderPeriodChip = (period: PeriodFilterValue) => {
    if (period === 'all') return null;
    const label = formatLocalizedPeriod(period, undefined, language);
    return (
      <button
        type="button"
        className={styles.chip}
        onClick={onRemovePeriod}
        aria-label={`${t.explore.removeFilterPrefix} ${label} ${t.explore.removePeriodFilterSuffix}`}
      >
        <span>{label}</span>
        <span className={styles.chipRemove} aria-hidden="true">
          ×
        </span>
      </button>
    );
  };

  const renderDietChip = (diet: DietFilterValue) => {
    if (diet === 'all') return null;
    const label = formatLocalizedDiet(diet, language);
    return (
      <button
        type="button"
        className={styles.chip}
        onClick={onRemoveDiet}
        aria-label={`${t.explore.removeFilterPrefix} ${label} ${t.explore.removeDietFilterSuffix}`}
      >
        <span>{label}</span>
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
        <span className={styles.countText}>{formatResultCount(count, language)}</span>

        {hasActiveFilters && (
          <div className={styles.activeChips}>
            {trimmedSearch.length > 0 && (
              <button
                type="button"
                className={styles.chip}
                onClick={onRemoveSearch}
                aria-label={`${t.explore.removeSearchQueryPrefix} "${trimmedSearch}"`}
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
          {t.explore.clearFilters}
        </button>
      )}
    </div>
  );
};
