import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { dinosaurs } from '@/data/dinosaurs';
import { formatPeriodLabel } from '@/data/periods';
import type { Dinosaur } from '@/types';
import { DIET_LABELS } from '../../types';
import { formatLength, getDinosaurInitials } from '../../utils';
import styles from './DinosaurCard.module.css';

export interface DinosaurCardProps {
  dinosaur: Dinosaur;
  specimenIndex?: number;
}

export const DinosaurCard: FC<DinosaurCardProps> = ({ dinosaur, specimenIndex }) => {
  const prefersReducedMotion = useReducedMotion();
  const periodLabel = formatPeriodLabel(dinosaur.period, dinosaur.periodStage);
  const dietLabel = DIET_LABELS[dinosaur.diet];
  const initials = getDinosaurInitials(dinosaur.scientificName);
  const periodClass = styles[`period_${dinosaur.period}`] ?? '';

  const index =
    specimenIndex ??
    (() => {
      const found = dinosaurs.findIndex((d) => d.slug === dinosaur.slug);
      return found >= 0 ? found + 1 : 1;
    })();
  const specimenCode = `SPECIMEN ${String(index).padStart(3, '0')}`;

  return (
    <motion.article
      className={styles.cardArticle}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Link
        to={`/dinosaur/${dinosaur.slug}`}
        className={styles.cardLink}
        aria-label={`${dinosaur.name} (${dinosaur.scientificName}) — ${periodLabel}, ${dietLabel}, approx. ${formatLength(dinosaur.lengthMeters)}`}
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

          <p className={styles.shortDescription}>{dinosaur.shortDescription}</p>

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
    </motion.article>
  );
};
