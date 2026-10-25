import type { FC } from 'react';
import { dinosaurs } from '@/data/dinosaurs';
import { formatPeriodLabel } from '@/data/periods';
import { DinosaurViewer } from '@/three/components';
import type { Dinosaur } from '@/types';
import { DIET_LABELS } from '../../types';
import {
  formatLength,
  formatMillionsOfYears,
  formatWeight,
  getDinosaurInitials,
} from '../../utils';
import styles from './DinosaurSummary.module.css';

export interface DinosaurSummaryProps {
  dinosaur: Dinosaur;
}

export const DinosaurSummary: FC<DinosaurSummaryProps> = ({ dinosaur }) => {
  const periodLabel = formatPeriodLabel(dinosaur.period, dinosaur.periodStage);
  const dietLabel = DIET_LABELS[dinosaur.diet];
  const ageRange = formatMillionsOfYears(dinosaur.livedFromMya, dinosaur.livedToMya);
  const initials = getDinosaurInitials(dinosaur.scientificName);
  const periodClass = styles[`period_${dinosaur.period}`] ?? '';

  const index = dinosaurs.findIndex((d) => d.slug === dinosaur.slug);
  const specimenCode = `SPECIMEN ${String(index >= 0 ? index + 1 : 1).padStart(3, '0')}`;

  return (
    <article className={styles.article}>
      <header className={styles.heroHeader}>
        <div className={styles.headerTop}>
          <div className={styles.eraMeta}>
            <span className={styles.periodTag}>
              {specimenCode} // {periodLabel}
            </span>
            <span className={styles.ageRange}>{ageRange}</span>
          </div>

          <div className={styles.titleRow}>
            <h1 className={styles.name}>{dinosaur.name}</h1>
            <div className={styles.taxonomyLine}>
              <span className={styles.scientificName}>{dinosaur.scientificName}</span>
              {dinosaur.meaning && (
                <span className={styles.meaning}>&ldquo;{dinosaur.meaning}&rdquo;</span>
              )}
            </div>
          </div>
        </div>

        <div
          className={`${styles.viewerViewport} ${periodClass}`}
          role="region"
          aria-label={`Visual viewport for ${dinosaur.name}`}
        >
          {dinosaur.modelPath ? (
            <DinosaurViewer name={dinosaur.name} modelPath={dinosaur.modelPath} />
          ) : dinosaur.image ? (
            <img src={dinosaur.image} alt={dinosaur.name} />
          ) : (
            <div className={styles.modelPlaceholder}>
              <span className={styles.viewerMonogram} aria-hidden="true">
                {initials}
              </span>
              <p className={styles.viewerLabel}>3D specimen currently cataloging</p>
              <span className={styles.viewerSubtext}>Specimen archive: {dinosaur.clade}</span>
            </div>
          )}
        </div>

        <div className={styles.quickStatsBar}>
          <div className={styles.quickStat}>
            <span className={styles.quickStatLabel}>Diet Classification</span>
            <span className={styles.quickStatValue}>{dietLabel}</span>
          </div>

          <div className={styles.quickStat}>
            <span className={styles.quickStatLabel}>Total Length</span>
            <span className={styles.quickStatValue}>
              Approx. {formatLength(dinosaur.lengthMeters)}
            </span>
          </div>

          {dinosaur.weightKg !== undefined && (
            <div className={styles.quickStat}>
              <span className={styles.quickStatLabel}>Estimated Mass</span>
              <span className={styles.quickStatValue}>~{formatWeight(dinosaur.weightKg)}</span>
            </div>
          )}

          {dinosaur.locations.length > 0 && (
            <div className={styles.quickStat}>
              <span className={styles.quickStatLabel}>Primary Region</span>
              <span className={styles.quickStatValue}>{dinosaur.locations.join(', ')}</span>
            </div>
          )}
        </div>
      </header>

      <div className={styles.contentGrid}>
        <section className={styles.sectionPlaque} aria-labelledby="about-heading">
          <h2 id="about-heading" className={styles.sectionHeading}>
            Anatomical Summary
          </h2>
          <p className={styles.leadText}>{dinosaur.shortDescription}</p>
          <p className={styles.bodyText}>{dinosaur.description}</p>

          {dinosaur.formations && dinosaur.formations.length > 0 && (
            <div>
              <h3 className={styles.sectionHeading} style={{ marginBottom: 'var(--space-3)' }}>
                Geological Formations
              </h3>
              <ul className={styles.tagList}>
                {dinosaur.formations.map((formation) => (
                  <li key={formation} className={styles.tagBadge}>
                    🪨 {formation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className={styles.sectionPlaque} aria-labelledby="profile-heading">
          <h2 id="profile-heading" className={styles.sectionHeading}>
            Specimen Classification
          </h2>

          <dl className={styles.profileList}>
            <div className={styles.profileItem}>
              <dt className={styles.profileTerm}>Geological Period</dt>
              <dd className={styles.profileDefinition}>{periodLabel}</dd>
            </div>

            <div className={styles.profileItem}>
              <dt className={styles.profileTerm}>Temporal Range</dt>
              <dd className={styles.profileDefinition}>{ageRange}</dd>
            </div>

            <div className={styles.profileItem}>
              <dt className={styles.profileTerm}>Diet</dt>
              <dd className={styles.profileDefinition}>{dietLabel}</dd>
            </div>

            <div className={styles.profileItem}>
              <dt className={styles.profileTerm}>Clade / Family</dt>
              <dd className={styles.profileDefinition}>{dinosaur.clade}</dd>
            </div>

            <div className={styles.profileItem}>
              <dt className={styles.profileTerm}>Length</dt>
              <dd className={styles.profileDefinition}>
                Approx. {formatLength(dinosaur.lengthMeters)}
              </dd>
            </div>

            {dinosaur.heightMeters !== undefined && (
              <div className={styles.profileItem}>
                <dt className={styles.profileTerm}>Hip / Shoulder Height</dt>
                <dd className={styles.profileDefinition}>
                  Approx. {formatLength(dinosaur.heightMeters)}
                </dd>
              </div>
            )}

            {dinosaur.weightKg !== undefined && (
              <div className={styles.profileItem}>
                <dt className={styles.profileTerm}>Estimated Weight</dt>
                <dd className={styles.profileDefinition}>~{formatWeight(dinosaur.weightKg)}</dd>
              </div>
            )}

            {dinosaur.locations.length > 0 && (
              <div className={styles.profileItem}>
                <dt className={styles.profileTerm}>Locations</dt>
                <dd className={styles.profileDefinition}>{dinosaur.locations.join(', ')}</dd>
              </div>
            )}

            {dinosaur.discoveredYear !== undefined && (
              <div className={styles.profileItem}>
                <dt className={styles.profileTerm}>First Discovered</dt>
                <dd className={styles.profileDefinition}>{dinosaur.discoveredYear}</dd>
              </div>
            )}

            {dinosaur.namedBy && (
              <div className={styles.profileItem}>
                <dt className={styles.profileTerm}>Named By</dt>
                <dd className={styles.profileDefinition}>{dinosaur.namedBy}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </article>
  );
};
