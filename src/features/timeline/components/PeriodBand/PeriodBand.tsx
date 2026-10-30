import type { FC } from 'react';
import { motion } from 'framer-motion';
import { geologicalPeriods } from '@/data/periods';
import { useReducedMotionPreference } from '@/hooks';
import { useTranslation } from '@/i18n';
import { motionEasing } from '@/lib/motion';
import type { GeologicalPeriod } from '@/types';
import { myaToTimelinePercent } from '../../utils/geologicalScale';
import { getPeriodFocusMya } from '../../utils/timelineUrl';
import styles from './PeriodBand.module.css';

export interface PeriodBandProps {
  activePeriodId: GeologicalPeriod | null;
  onJumpToPeriod: (mya: number) => void;
}

/**
 * Period bands: the geological backdrop of the axis.
 *
 * Widths come from the canonical period records, so the Triassic band is
 * genuinely narrower than the Cretaceous one. Purely presentational — pointer
 * interaction lives on the axis above, so this never competes for the drag.
 */
export const PeriodBand: FC<PeriodBandProps> = ({ activePeriodId, onJumpToPeriod }) => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <div className={styles.bands} aria-hidden="true">
      {geologicalPeriods.map((period) => {
        const startPercent = myaToTimelinePercent(period.startMya);
        const widthPercent = myaToTimelinePercent(period.endMya) - startPercent;
        const isActive = activePeriodId === period.id;
        const name = t.periods[period.id]?.name ?? period.name;

        const focusMya =
          getPeriodFocusMya(period.id) ?? Math.round((period.startMya + period.endMya) / 2);

        return (
          <motion.button
            key={period.id}
            type="button"
            tabIndex={-1}
            className={`${styles.band} ${styles[period.id]} ${isActive ? styles.isActive : ''}`}
            style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
            onClick={() => onJumpToPeriod(focusMya)}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.55, ease: motionEasing.museum }}
          >
            <span className={styles.bandName}>{name}</span>
            <span className={styles.bandRange}>
              {period.startMya}–{period.endMya} {t.timeline.myaUnit}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
