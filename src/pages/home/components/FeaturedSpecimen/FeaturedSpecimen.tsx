import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Container } from '@/components/ui';
import { tyrannosaurusRex } from '@/data/dinosaurs/tyrannosaurus-rex';
import { useReducedMotionPreference } from '@/hooks';
import { getLocalizedDinosaurContent, useTranslation } from '@/i18n';
import { motionEasing, motionStagger } from '@/lib/motion';
import { preloadDinosaurModel } from '@/three/loaders';
import styles from './FeaturedSpecimen.module.css';

/**
 * 02 — Exhibition Spotlight: Specimen 001.
 *
 * Sequence: label → species heading → description → metrics → visual panel.
 * Each step is a small, even stagger (~70ms) so the plaque reads as one
 * composed unit arriving rather than five separate animations.
 */
export const FeaturedSpecimen: FC = () => {
  const { t, language } = useTranslation();
  const prefersReducedMotion = useReducedMotionPreference();
  const dino = tyrannosaurusRex;
  const localizedDino = getLocalizedDinosaurContent(dino, language);
  const handlePreload = () => preloadDinosaurModel(dino.modelPath);

  const steps = [
    <div key="header" className={styles.specimenHeader}>
      <span className={styles.specimenCode}>{t.home.featuredSpecimen.specimenCode}</span>
      <span className={styles.clade}>{dino.clade}</span>
    </div>,

    <div key="names" className={styles.nameGroup}>
      <h2 id="featured-specimen-heading" className={styles.commonName}>
        Tyrannosaurus
      </h2>
      <span className={styles.scientificName}>{dino.scientificName}</span>
    </div>,

    <p key="description" className={styles.description}>
      {localizedDino.description}
    </p>,

    <div key="metrics" className={styles.metricsGrid}>
      <div className={styles.metricItem}>
        <span className={styles.metricLabel}>{t.home.featuredSpecimen.geologicalAgeLabel}</span>
        <span className={styles.metricValue}>{t.home.featuredSpecimen.geologicalAgeValue}</span>
      </div>
      <div className={styles.metricItem}>
        <span className={styles.metricLabel}>{t.home.featuredSpecimen.totalLengthLabel}</span>
        <span className={styles.metricValue}>{t.home.featuredSpecimen.totalLengthValue}</span>
      </div>
      <div className={styles.metricItem}>
        <span className={styles.metricLabel}>{t.home.featuredSpecimen.estimatedMassLabel}</span>
        <span className={styles.metricValue}>{t.home.featuredSpecimen.estimatedMassValue}</span>
      </div>
    </div>,

    <div key="action">
      <Link to={`/dinosaur/${dino.slug}`} onPointerEnter={handlePreload} onFocus={handlePreload}>
        <Button variant="secondary">{t.home.featuredSpecimen.examineRecordCta}</Button>
      </Link>
    </div>,
  ];

  return (
    <section className={styles.section} aria-labelledby="featured-specimen-heading">
      <Container>
        <div className={styles.innerGrid}>
          {prefersReducedMotion ? (
            <div className={styles.infoColumn}>{steps}</div>
          ) : (
            <motion.div
              className={styles.infoColumn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: motionStagger.tight + 0.01 } },
              }}
            >
              {steps.map((step, stepIndex) => (
                <motion.div
                  key={stepIndex}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.55, ease: motionEasing.museum },
                    },
                  }}
                >
                  {step}
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className={styles.visualColumn} aria-hidden="true">
            <div className={styles.visualAtmosphere} aria-hidden="true" />
            <span className={styles.visualBadge}>{t.home.featuredSpecimen.visualBadge}</span>
            <span className={styles.monogramLarge} aria-hidden="true">
              T.r.
            </span>
            <span className={styles.visualFootnote}>{t.home.featuredSpecimen.visualFootnote}</span>
          </div>
        </div>
      </Container>
    </section>
  );
};
