import type { FC } from 'react';
import { useTranslation } from '@/i18n';
import type { GeologicalPeriod } from '@/types';
import { geologicalPeriods } from '@/data/periods';
import styles from './TimelineControls.module.css';

export interface TimelineControlsProps {
  activePeriod: GeologicalPeriod | null;
  onSelectPeriod: (period: GeologicalPeriod | null) => void;
  onReset: () => void;
  /** True when a supplied `time` value was unusable and got rejected. */
  hadInvalidTime: boolean;
  /** True when a numeric value was clamped into the Mesozoic window. */
  wasClamped: boolean;
}

/**
 * Period filter and reset.
 *
 * Filtering narrows which rows are LISTED; it never alters range coordinates,
 * so a Jurassic specimen keeps its true span even while the Cretaceous filter
 * is active.
 */
export const TimelineControls: FC<TimelineControlsProps> = ({
  activePeriod,
  onSelectPeriod,
  onReset,
  hadInvalidTime,
  wasClamped,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.controls}>
      <div
        className={styles.filterGroup}
        role="group"
        aria-label={t.timeline.periodFilterAriaLabel}
      >
        <button
          type="button"
          className={`${styles.filter} ${activePeriod === null ? styles.filterActive : ''}`}
          onClick={() => onSelectPeriod(null)}
          aria-pressed={activePeriod === null}
        >
          {t.timeline.filterAll}
        </button>

        {geologicalPeriods.map((period) => {
          const name = t.periods[period.id]?.name ?? period.name;
          const isActive = activePeriod === period.id;
          return (
            <button
              key={period.id}
              type="button"
              className={`${styles.filter} ${isActive ? styles.filterActive : ''}`}
              onClick={() => onSelectPeriod(isActive ? null : period.id)}
              aria-pressed={isActive}
            >
              {name}
            </button>
          );
        })}
      </div>

      <div className={styles.rightGroup}>
        {(hadInvalidTime || wasClamped) && (
          <p className={styles.notice} role="status">
            {hadInvalidTime ? t.timeline.invalidTimeNotice : t.timeline.clampedTimeNotice}
          </p>
        )}
        <button type="button" className={styles.reset} onClick={onReset}>
          {t.timeline.reset}
        </button>
      </div>
    </div>
  );
};
