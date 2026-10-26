import type { FC } from 'react';
import { dinosaurs } from '@/data/dinosaurs';
import { Reveal } from '@/components/common';
import { formatPeriodLabel } from '@/data/periods';
import { formatLocalizedDiet, getLocalizedDinosaurContent, useTranslation } from '@/i18n';
import { DinosaurViewer } from '@/three/components';
import type { Dinosaur } from '@/types';
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
  const { t, language } = useTranslation();

  const periodLabel = formatPeriodLabel(dinosaur.period, dinosaur.periodStage, language);
  const dietLabel = formatLocalizedDiet(dinosaur.diet, language);
  const ageRange = formatMillionsOfYears(dinosaur.livedFromMya, dinosaur.livedToMya, language);
  const localizedContent = getLocalizedDinosaurContent(dinosaur, language);
  const initials = getDinosaurInitials(dinosaur.scientificName);
  const periodClass = styles[`period_${dinosaur.period}`] ?? '';

  const index = dinosaurs.findIndex((d) => d.slug === dinosaur.slug);
  const specimenCode = `${t.explore.specimenLabel} ${String(index >= 0 ? index + 1 : 1).padStart(3, '0')}`;

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
              {localizedContent.meaning && (
                <span className={styles.meaning}>&ldquo;{localizedContent.meaning}&rdquo;</span>
              )}
            </div>
          </div>
        </div>

        <div
          className={`${styles.viewerViewport} ${periodClass}`}
          role="region"
          aria-label={`${t.detail.visualViewportAria} ${dinosaur.name}`}
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
              <p className={styles.viewerLabel}>{t.detail.modelCataloging}</p>
              <span className={styles.viewerSubtext}>
                {t.detail.specimenArchivePrefix} {dinosaur.clade}
              </span>
            </div>
          )}
        </div>

        <div className={styles.quickStatsBar}>
          <div className={styles.quickStat}>
            <span className={styles.quickStatLabel}>{t.detail.dietClassification}</span>
            <span className={styles.quickStatValue}>{dietLabel}</span>
          </div>

          <div className={styles.quickStat}>
            <span className={styles.quickStatLabel}>{t.detail.totalLength}</span>
            <span className={styles.quickStatValue}>
              {t.detail.approxCapitalized} {formatLength(dinosaur.lengthMeters)}
            </span>
          </div>

          {dinosaur.weightKg !== undefined && (
            <div className={styles.quickStat}>
              <span className={styles.quickStatLabel}>{t.detail.estimatedMass}</span>
              <span className={styles.quickStatValue}>
                ~{formatWeight(dinosaur.weightKg, language)}
              </span>
            </div>
          )}

          {localizedContent.locations.length > 0 && (
            <div className={styles.quickStat}>
              <span className={styles.quickStatLabel}>{t.detail.primaryRegion}</span>
              <span className={styles.quickStatValue}>{localizedContent.locations.join(', ')}</span>
            </div>
          )}
        </div>
      </header>

      <div className={styles.contentGrid}>
        <Reveal className={styles.sectionPlaque} as="section" distance={20}>
          <h2 id="about-heading" className={styles.sectionHeading}>
            {t.detail.anatomicalSummary}
          </h2>
          <p className={styles.leadText}>{localizedContent.shortDescription}</p>
          <p className={styles.bodyText}>{localizedContent.description}</p>

          {dinosaur.formations && dinosaur.formations.length > 0 && (
            <div>
              <h3 className={styles.sectionHeading} style={{ marginBottom: 'var(--space-3)' }}>
                {t.detail.geologicalFormations}
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
        </Reveal>

        <Reveal className={styles.sectionPlaque} as="section" distance={20} delay={0.08}>
          <h2 id="profile-heading" className={styles.sectionHeading}>
            {t.detail.specimenClassification}
          </h2>

          <dl className={styles.profileList}>
            <div className={styles.profileItem}>
              <dt className={styles.profileTerm}>{t.detail.geologicalPeriod}</dt>
              <dd className={styles.profileDefinition}>{periodLabel}</dd>
            </div>

            <div className={styles.profileItem}>
              <dt className={styles.profileTerm}>{t.detail.temporalRange}</dt>
              <dd className={styles.profileDefinition}>{ageRange}</dd>
            </div>

            <div className={styles.profileItem}>
              <dt className={styles.profileTerm}>{t.detail.diet}</dt>
              <dd className={styles.profileDefinition}>{dietLabel}</dd>
            </div>

            <div className={styles.profileItem}>
              <dt className={styles.profileTerm}>{t.detail.cladeFamily}</dt>
              <dd className={styles.profileDefinition}>{dinosaur.clade}</dd>
            </div>

            <div className={styles.profileItem}>
              <dt className={styles.profileTerm}>{t.detail.length}</dt>
              <dd className={styles.profileDefinition}>
                {t.detail.approxCapitalized} {formatLength(dinosaur.lengthMeters)}
              </dd>
            </div>

            {dinosaur.heightMeters !== undefined && (
              <div className={styles.profileItem}>
                <dt className={styles.profileTerm}>{t.detail.hipShoulderHeight}</dt>
                <dd className={styles.profileDefinition}>
                  {t.detail.approxCapitalized} {formatLength(dinosaur.heightMeters)}
                </dd>
              </div>
            )}

            {dinosaur.weightKg !== undefined && (
              <div className={styles.profileItem}>
                <dt className={styles.profileTerm}>{t.detail.estimatedWeight}</dt>
                <dd className={styles.profileDefinition}>
                  ~{formatWeight(dinosaur.weightKg, language)}
                </dd>
              </div>
            )}

            {localizedContent.locations.length > 0 && (
              <div className={styles.profileItem}>
                <dt className={styles.profileTerm}>{t.detail.locations}</dt>
                <dd className={styles.profileDefinition}>
                  {localizedContent.locations.join(', ')}
                </dd>
              </div>
            )}

            {dinosaur.discoveredYear !== undefined && (
              <div className={styles.profileItem}>
                <dt className={styles.profileTerm}>{t.detail.firstDiscovered}</dt>
                <dd className={styles.profileDefinition}>{dinosaur.discoveredYear}</dd>
              </div>
            )}

            {dinosaur.namedBy && (
              <div className={styles.profileItem}>
                <dt className={styles.profileTerm}>{t.detail.namedBy}</dt>
                <dd className={styles.profileDefinition}>{dinosaur.namedBy}</dd>
              </div>
            )}
          </dl>
        </Reveal>
      </div>
    </article>
  );
};
