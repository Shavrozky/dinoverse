import type { FC } from 'react';
import { motion } from 'framer-motion';
import { geologicalPeriods } from '@/data/periods';
import { useReducedMotionPreference } from '@/hooks';
import { useTranslation } from '@/i18n';
import { motionEasing } from '@/lib/motion';
import type { Dinosaur } from '@/types';
import { myaToTimelinePercent, toRangeSegment } from '../../utils/geologicalScale';
import styles from './SpeciesRanges.module.css';

export interface SpeciesRangesProps {
  species: readonly Dinosaur[];
  activeIds: ReadonlySet<string>;
  highlightedId: string | null;
  selectedMya: number;
  onHighlight: (id: string | null) => void;
}

/**
 * Species range list — names plus true-coordinate range bars.
 *
 * One row per specimen, ordered oldest-appearance first. Each bar spans its
 * real Myr interval on the shared 252→66 axis, so a 2 Myr range renders as a
 * sliver and a 10 Myr range as a third of the row. Bars are never normalised
 * to equal widths; that would destroy the exhibit's meaning.
 *
 * Rows stay mounted and only change emphasis as the cursor moves — no
 * unmount/remount churn while scrubbing.
 */
export const SpeciesRanges: FC<SpeciesRangesProps> = ({
  species,
  activeIds,
  highlightedId,
  selectedMya,
  onHighlight,
}) => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotionPreference();
  const cursorPercent = myaToTimelinePercent(selectedMya);

  return (
    <ul className={styles.list}>
      {species.map((dinosaur, index) => {
        const isActive = activeIds.has(dinosaur.id);
        const isHighlighted = highlightedId === dinosaur.id;
        const { startPercent, widthPercent } = toRangeSegment(dinosaur);

        return (
          <motion.li
            key={dinosaur.id}
            className={`${styles.row} ${isActive ? styles.active : styles.inactive} ${
              isHighlighted ? styles.highlighted : ''
            }`}
            onPointerEnter={() => onHighlight(dinosaur.id)}
            onPointerLeave={() => onHighlight(null)}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.45,
              delay: prefersReducedMotion ? 0 : index * 0.02,
              ease: motionEasing.museum,
            }}
          >
            <div className={styles.nameCell}>
              <span className={styles.name}>{dinosaur.name}</span>
              <span className={styles.range}>
                {dinosaur.livedFromMya}–{dinosaur.livedToMya} {t.timeline.myaUnit}
              </span>
            </div>

            <div className={styles.track} aria-hidden="true">
              {/* Period bands behind every bar keep rows comparable. */}
              {geologicalPeriods.map((period) => {
                const bandStart = myaToTimelinePercent(period.startMya);
                const bandWidth = myaToTimelinePercent(period.endMya) - bandStart;
                return (
                  <span
                    key={period.id}
                    className={styles.trackBand}
                    style={{
                      left: `${bandStart}%`,
                      width: `${bandWidth}%`,
                    }}
                  />
                );
              })}

              <motion.span
                className={styles.bar}
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                }}
                initial={prefersReducedMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.7,
                  delay: prefersReducedMotion ? 0 : 0.1 + index * 0.02,
                  ease: motionEasing.museum,
                }}
              />

              <span className={styles.cursorTick} style={{ left: `${cursorPercent}%` }} />
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
};
