import type { FC } from 'react';
import {
  formatLocalizedDiet,
  formatLocalizedPeriod,
  getLocalizedDinosaurContent,
  useTranslation,
} from '@/i18n';
import { formatLength, formatMillionsOfYears, formatWeight } from '@/features/dinosaurs/utils';
import type { Dinosaur } from '@/types';
import styles from './ComparisonStats.module.css';

export interface ComparisonStatsProps {
  specimens: readonly Dinosaur[];
}

interface MetricRow {
  key: string;
  label: string;
  render: (dinosaur: Dinosaur) => string;
  /** Rows whose absence should be flagged as an incomplete record. */
  optional?: boolean;
}

/**
 * Comparative measurement plate.
 *
 * A museum specimen-record layout, not a spreadsheet: row labels in brass
 * micro-type, specimen columns in serif. Missing measurements render as an
 * explicit "not documented" marker — never as zero, and never as a silent
 * estimate, because the archive records genuinely differ in completeness.
 *
 * The grid is flat (one cell per row×column) rather than nested wrappers, which
 * keeps every column aligned regardless of how many specimens are compared.
 */
export const ComparisonStats: FC<ComparisonStatsProps> = ({ specimens }) => {
  const { t, language } = useTranslation();

  if (specimens.length === 0) {
    return null;
  }

  const rows: MetricRow[] = [
    {
      key: 'length',
      label: t.compare.metricLength,
      render: (dinosaur) => formatLength(dinosaur.lengthMeters),
    },
    {
      key: 'height',
      label: t.compare.metricHeight,
      optional: true,
      render: (dinosaur) =>
        typeof dinosaur.heightMeters === 'number' && dinosaur.heightMeters > 0
          ? formatLength(dinosaur.heightMeters)
          : t.compare.notDocumented,
    },
    {
      key: 'mass',
      label: t.compare.metricMass,
      optional: true,
      render: (dinosaur) =>
        typeof dinosaur.weightKg === 'number' && dinosaur.weightKg > 0
          ? formatWeight(dinosaur.weightKg, language)
          : t.compare.notDocumented,
    },
    {
      key: 'diet',
      label: t.compare.metricDiet,
      render: (dinosaur) => formatLocalizedDiet(dinosaur.diet, language),
    },
    {
      key: 'period',
      label: t.compare.metricPeriod,
      render: (dinosaur) => formatLocalizedPeriod(dinosaur.period, dinosaur.periodStage, language),
    },
    {
      key: 'range',
      label: t.compare.metricRange,
      render: (dinosaur) =>
        formatMillionsOfYears(dinosaur.livedFromMya, dinosaur.livedToMya, language),
    },
    {
      key: 'clade',
      label: t.compare.metricClade,
      render: (dinosaur) => dinosaur.clade,
    },
    {
      key: 'locations',
      label: t.compare.metricLocations,
      render: (dinosaur) => getLocalizedDinosaurContent(dinosaur, language).locations.join(', '),
    },
  ];

  const hasIncompleteRecords = rows.some(
    (row) =>
      row.optional && specimens.some((dinosaur) => row.render(dinosaur) === t.compare.notDocumented)
  );

  return (
    <section className={styles.statsSection} aria-label={t.compare.metricsAriaLabel}>
      <header className={styles.statsHeader}>
        <span className={styles.statsEyebrow}>{t.compare.eyebrow}</span>
        <h2 className={styles.statsTitle}>{t.compare.metricsTitle}</h2>
      </header>

      <div
        className={styles.table}
        style={{
          gridTemplateColumns: `minmax(110px, 0.85fr) repeat(${specimens.length}, minmax(0, 1fr))`,
        }}
        role="table"
        aria-label={t.compare.metricsAriaLabel}
      >
        <div
          className={styles.cornerCell}
          role="columnheader"
          aria-label={t.compare.specimenLabel}
        />

        {specimens.map((dinosaur) => (
          <div key={dinosaur.id} className={styles.columnHeader} role="columnheader">
            <span className={styles.columnName}>{dinosaur.name}</span>
            <span className={styles.columnScientific}>{dinosaur.scientificName}</span>
          </div>
        ))}

        {rows.map((row) => {
          const cells = specimens.map((dinosaur) => {
            const value = row.render(dinosaur);
            return {
              id: dinosaur.id,
              value,
              missing: value === t.compare.notDocumented,
            };
          });

          return (
            <div key={row.key} className={styles.rowContents}>
              <div className={styles.rowLabel} role="rowheader">
                {row.label}
              </div>
              {cells.map((cell) => (
                <div
                  key={`${row.key}-${cell.id}`}
                  className={`${styles.valueCell} ${cell.missing ? styles.valueMissing : ''}`}
                  role="cell"
                >
                  {cell.value}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {hasIncompleteRecords && (
        <p className={styles.incompleteNote}>
          {t.compare.notDocumented} — {t.compare.insightCaveat}
        </p>
      )}
    </section>
  );
};
