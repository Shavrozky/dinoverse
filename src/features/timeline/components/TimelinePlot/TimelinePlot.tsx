import { useCallback, useRef, type FC } from 'react';
import { useTranslation } from '@/i18n';
import { KPg_BOUNDARY_MYA, MESOZOIC_OLDEST_MYA, MESOZOIC_YOUNGEST_MYA } from '../../types/timeline';
import { myaToTimelinePercent, timelinePercentToMya } from '../../utils/geologicalScale';
import { formatMyaValue } from '../../utils/timelineLabels';
import styles from './TimelinePlot.module.css';

export interface TimelinePlotProps {
  /** Ticks in MYA, oldest first. */
  ticks: readonly number[];
  selectedMya: number;
  /** Period label at the cursor, for the handle caption. */
  periodName: string;
  ariaLabel: string;
  ariaValueText: string;
  onScrub: (mya: number) => void;
  onStep: (direction: -1 | 1, coarse: boolean) => void;
}

/**
 * The interactive axis.
 *
 * A genuine slider: one tab stop, arrow-key control, and pointer drag with
 * capture. `role="slider"` is on a plain div rather than the SVG so the
 * accessible name/value semantics stay clean and text never gets stretched by
 * a non-uniform viewBox.
 *
 * Coordinates are computed from the same `252 → 66` inversion used everywhere
 * else — MYA decreases left to right.
 */
export const TimelinePlot: FC<TimelinePlotProps> = ({
  ticks,
  selectedMya,
  periodName,
  ariaLabel,
  ariaValueText,
  onScrub,
  onStep,
}) => {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const percent = myaToTimelinePercent(selectedMya);

  const scrubFromClientX = useCallback(
    (clientX: number) => {
      const node = trackRef.current;
      if (!node) {
        return;
      }
      const rect = node.getBoundingClientRect();
      if (rect.width <= 0) {
        return;
      }
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onScrub(timelinePercentToMya(ratio * 100));
    },
    [onScrub]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.focus();
      scrubFromClientX(event.clientX);
    },
    [scrubFromClientX]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (draggingRef.current) {
        scrubFromClientX(event.clientX);
      }
    },
    [scrubFromClientX]
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const coarse = event.shiftKey;
      // Left = older (back in time), Right = younger. MYA therefore rises left.
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onStep(-1, coarse);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onStep(1, coarse);
      } else if (event.key === 'PageUp') {
        event.preventDefault();
        onStep(-1, true);
      } else if (event.key === 'PageDown') {
        event.preventDefault();
        onStep(1, true);
      } else if (event.key === 'Home') {
        event.preventDefault();
        onScrub(MESOZOIC_OLDEST_MYA);
      } else if (event.key === 'End') {
        event.preventDefault();
        onScrub(MESOZOIC_YOUNGEST_MYA);
      }
    },
    [onScrub, onStep]
  );

  return (
    <div className={styles.axis}>
      <div className={styles.axisHeader}>
        <span className={styles.axisBound}>
          {MESOZOIC_OLDEST_MYA} {t.timeline.myaUnit}
        </span>
        <span className={styles.axisHint}>{t.timeline.axisHint}</span>
        <span className={styles.axisBound}>
          {MESOZOIC_YOUNGEST_MYA} {t.timeline.myaUnit}
        </span>
      </div>

      <div
        ref={trackRef}
        className={styles.track}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={MESOZOIC_YOUNGEST_MYA}
        aria-valuemax={MESOZOIC_OLDEST_MYA}
        aria-valuenow={Math.round(selectedMya * 10) / 10}
        aria-valuetext={ariaValueText}
        aria-orientation="horizontal"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.trackLine} aria-hidden="true" />

        {ticks.map((tick) => (
          <span
            key={tick}
            className={styles.tick}
            style={{ left: `${myaToTimelinePercent(tick)}%` }}
            aria-hidden="true"
          >
            <span className={styles.tickMark} />
            <span className={styles.tickLabel}>{tick}</span>
          </span>
        ))}

        {/* K–Pg boundary hairline. */}
        <span
          className={styles.kpg}
          style={{ left: `${myaToTimelinePercent(KPg_BOUNDARY_MYA)}%` }}
          aria-hidden="true"
        />

        <span className={styles.cursor} style={{ left: `${percent}%` }} aria-hidden="true">
          <span className={styles.cursorLine} />
        </span>

        <div className={styles.handleRow} aria-hidden="true">
          <span className={styles.handle} style={{ left: `${percent}%` }}>
            <span className={styles.handleValue}>
              {formatMyaValue(selectedMya)} {t.timeline.myaUnit}
            </span>
            <span className={styles.handlePeriod}>{periodName}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
