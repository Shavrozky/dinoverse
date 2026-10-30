import type { FC } from 'react';
import { interpolate, useTranslation } from '@/i18n';
import { formatLength } from '@/features/dinosaurs/utils';
import type { Dinosaur } from '@/types';
import {
  formatRatio,
  getLargestSpecimen,
  getLengthRatio,
  getMassRatio,
  getSmallestSpecimen,
  orderByLength,
} from '../../utils/comparisonMetrics';
import styles from './ComparisonInsights.module.css';

export interface ComparisonInsightsProps {
  specimens: readonly Dinosaur[];
}

/**
 * Curatorial notes — derived, human-readable sentences about the comparison.
 *
 * Every sentence is computed from canonical records and is only emitted when
 * both required measurements exist. Nothing is estimated to fill a gap, and the
 * closing caveat keeps the framing explicitly approximate rather than asserting
 * exact physical truth.
 */
export const ComparisonInsights: FC<ComparisonInsightsProps> = ({ specimens }) => {
  const { t } = useTranslation();

  if (specimens.length < 2) {
    return null;
  }

  const notes: string[] = [];

  const largest = getLargestSpecimen(specimens);
  const smallest = getSmallestSpecimen(specimens);

  if (largest && smallest && largest.id !== smallest.id) {
    notes.push(
      interpolate(t.compare.insightLargest, {
        name: largest.name,
        length: formatLength(largest.lengthMeters),
      })
    );
    notes.push(
      interpolate(t.compare.insightSmallest, {
        name: smallest.name,
        length: formatLength(smallest.lengthMeters),
      })
    );

    // Order once, larger → smaller, and use the pair for both ratios.
    const [longer, shorter] = orderByLength(largest, smallest);

    const lengthRatio = getLengthRatio(longer, shorter);
    if (lengthRatio !== null) {
      notes.push(
        interpolate(t.compare.insightLength, {
          longer: longer.name,
          shorter: shorter.name,
          ratio: formatRatio(lengthRatio),
        })
      );
    }

    // Mass ratio, heavier → lighter (only when both masses are documented).
    const massRatio = getMassRatio(longer, shorter);
    if (massRatio !== null && massRatio >= 1) {
      notes.push(
        interpolate(t.compare.insightMass, {
          heavier: longer.name,
          lighter: shorter.name,
          ratio: formatRatio(massRatio),
        })
      );
    }
  }

  if (notes.length === 0) {
    return null;
  }

  return (
    <section className={styles.insights} aria-label={t.compare.insightsTitle}>
      <h2 className={styles.heading}>{t.compare.insightsTitle}</h2>
      <ul className={styles.list}>
        {notes.map((note) => (
          <li key={note} className={styles.item}>
            <span className={styles.bullet} aria-hidden="true" />
            {note}
          </li>
        ))}
      </ul>
      <p className={styles.caveat}>{t.compare.insightCaveat}</p>
    </section>
  );
};
