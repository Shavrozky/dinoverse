import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { dinosaurs } from '@/data/dinosaurs';
import { formatPeriodLabel } from '@/data/periods';
import { formatLocalizedDiet, getLocalizedDinosaurContent, useTranslation } from '@/i18n';
import type { Dinosaur } from '@/types';
import { formatLength, getDinosaurInitials } from '../../utils';
import styles from './DinosaurCard.module.css';

export interface DinosaurCardProps {
  dinosaur: Dinosaur;
  specimenIndex?: number;
}

/**
 * Museum specimen plate.
 *
 * Intentionally static: entrance animation is owned by `StaggeredCards` so the
 * whole grid arrives as one authored group rather than each card animating
 * itself. Hover/focus feedback is CSS-only (transform + colour), which keeps it
 * off the main thread and automatically respects `prefers-reduced-motion`.
 */
export const DinosaurCard: FC<DinosaurCardProps> = ({ dinosaur, specimenIndex }) => {
  const { t, language } = useTranslation();

  const periodLabel = formatPeriodLabel(dinosaur.period, dinosaur.periodStage, language);
  const dietLabel = formatLocalizedDiet(dinosaur.diet, language);
  const localizedContent = getLocalizedDinosaurContent(dinosaur, language);
  const initials = getDinosaurInitials(dinosaur.scientificName);
  const periodClass = styles[`period_${dinosaur.period}`] ?? '';

  const index =
    specimenIndex ??
    (() => {
      const found = dinosaurs.findIndex((d) => d.slug === dinosaur.slug);
      return found >= 0 ? found + 1 : 1;
    })();
  const specimenCode = `${t.explore.specimenLabel} ${String(index).padStart(3, '0')}`;

  return (
    <article className={styles.cardArticle}>
      <Link
        to={`/dinosaur/${dinosaur.slug}`}
        className={styles.cardLink}
        aria-label={`${dinosaur.name} (${dinosaur.scientificName}) — ${periodLabel}, ${dietLabel}, ${t.explore.approxShort} ${formatLength(dinosaur.lengthMeters)}`}
      >
        <div className={styles.plateHeader}>
          <span className={styles.specimenNumber}>{specimenCode}</span>
          <span className={styles.eraTag}>{periodLabel}</span>
        </div>

        <div className={`${styles.visualContainer} ${periodClass}`}>
          {dinosaur.image ? (
            <img
              src={dinosaur.image}
              alt={dinosaur.name}
              className={styles.specimenImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.placeholderArt} aria-hidden="true">
              <span className={styles.monogram}>{initials}</span>
              <span className={styles.cladeTag}>{dinosaur.clade}</span>
            </div>
          )}
        </div>

        <div className={styles.cardBody}>
          <div className={styles.headerGroup}>
            <h3 className={styles.title}>{dinosaur.name}</h3>
            <span className={styles.scientificName}>{dinosaur.scientificName}</span>
          </div>

          <p className={styles.shortDescription}>{localizedContent.shortDescription}</p>

          <div className={styles.metaFooter}>
            <div>
              <span className={styles.dietTag}>{dietLabel}</span>
              <span> • </span>
              <span>{formatLength(dinosaur.lengthMeters)}</span>
            </div>
            <span className={styles.arrowIndicator} aria-hidden="true">
              →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};
