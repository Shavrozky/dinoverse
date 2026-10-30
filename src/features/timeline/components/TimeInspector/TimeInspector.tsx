import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatLocalizedPeriod } from '@/i18n';
import { useTranslation } from '@/i18n';
import { useReducedMotionPreference } from '@/hooks';
import { motionEasing } from '@/lib/motion';
import type { Dinosaur } from '@/types';
import { formatMyaValue } from '../../utils/timelineLabels';
import styles from './TimeInspector.module.css';

export interface TimeInspectorProps {
  selectedMya: number;
  periodId: Dinosaur['period'] | null;
  periodName: string | null;
  activeSpecies: readonly Dinosaur[];
}

/**
 * Time inspector.
 *
 * Reports the cursor's moment, its period, and which collection specimens were
 * alive then. The wording is deliberately "represented in the DinoVerse
 * collection" — this is a 20-record sample, not a census of Mesozoic life, and
 * the panel must not imply otherwise.
 */
export const TimeInspector: FC<TimeInspectorProps> = ({
  selectedMya,
  periodId,
  periodName,
  activeSpecies,
}) => {
  const { t, language } = useTranslation();
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <motion.aside
      className={styles.inspector}
      aria-live="polite"
      aria-label={t.timeline.inspectorAriaLabel}
      initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: motionEasing.museum }}
    >
      <div className={styles.timeBlock}>
        <span className={styles.timeValue}>{formatMyaValue(selectedMya)}</span>
        <span className={styles.timeUnit}>{t.timeline.myaUnit}</span>
      </div>

      {periodId && (
        <p className={styles.periodName}>
          {formatLocalizedPeriod(periodId, undefined, language) || periodName}
        </p>
      )}

      <div className={styles.divider} aria-hidden="true" />

      <h3 className={styles.speciesHeading}>{t.timeline.inspectorSpeciesHeading}</h3>

      {activeSpecies.length === 0 ? (
        <p className={styles.emptyNote}>{t.timeline.inspectorEmpty}</p>
      ) : (
        <ul className={styles.speciesList}>
          {activeSpecies.map((dinosaur) => (
            <li key={dinosaur.id}>
              <Link to={`/dinosaur/${dinosaur.slug}`} className={styles.speciesLink}>
                <span className={styles.speciesName}>{dinosaur.name}</span>
                <span className={styles.speciesRange}>
                  {dinosaur.livedFromMya}–{dinosaur.livedToMya} {t.timeline.myaUnit}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className={styles.boundaryNote}>{t.timeline.boundaryNote}</p>
    </motion.aside>
  );
};
