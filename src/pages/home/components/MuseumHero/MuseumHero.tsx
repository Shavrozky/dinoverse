import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Button, Container } from '@/components/ui';
import { ArchivalRule, StatCounter } from '@/components/common';
import { useGlobalPointer, useReducedMotionPreference } from '@/hooks';
import { useTranslation } from '@/i18n';
import { heroTimeline, motionDistance, motionDurations, motionEasing } from '@/lib/motion';
import { useAppSettings } from '@/store';
import { ThreeCanvas } from '@/three/components';
import { HeroScene } from '@/three/scenes';
import styles from './MuseumHero.module.css';

/**
 * One step of the hero's staged entrance, expressed as variants.
 *
 * Variants (rather than inline initial/animate props) keep the transition
 * declaration in one place and satisfy Framer Motion's prop types exactly.
 *
 * Deliberately limited to opacity + a small upward settle: the hero typography
 * must feel heavy and editorial, so no scale, rotation, spring or overshoot.
 * Under reduced motion the element starts fully opaque with a zero-length
 * transition — nothing is staged, nothing is delayed, layout is identical.
 */
function stagedVariants(delay: number, instant: boolean): Variants {
  return {
    hidden: { opacity: instant ? 1 : 0, y: instant ? 0 : motionDistance.settle },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: instant ? 0 : motionDurations.slow,
        delay: instant ? 0 : delay,
        ease: motionEasing.museum,
      },
    },
  };
}

/**
 * Homepage exhibition hero.
 *
 * The entrance is authored as a single timeline (see `heroTimeline`) so the eye
 * is led: archive label → eyebrow → headline → description → actions →
 * statistics, while the specimen lighting comes up behind the type.
 */
export const MuseumHero: FC = () => {
  const prefersReducedMotion = useReducedMotionPreference();
  const { t, language } = useTranslation();
  const theme = useAppSettings((state) => state.theme);

  // One window-level pointer listener serves both the specimen and the lights.
  const pointer = useGlobalPointer(!prefersReducedMotion);

  // Reduced motion: everything is simply present, with no staged delay.
  const instant = prefersReducedMotion;

  return (
    <section className={styles.heroSection} aria-label={t.hero.sectionAriaLabel}>
      <Container>
        <div className={styles.contentWrapper}>
          {/* Primary Editorial Typography & CTAs */}
          <div className={styles.textContent}>
            <motion.div
              className={styles.archiveBadge}
              variants={stagedVariants(heroTimeline.badge, instant)}
              initial="hidden"
              animate="visible"
            >
              <span className={styles.dot} />
              <span>{t.hero.archiveBadge}</span>
            </motion.div>

            <div className={styles.headlineGroup}>
              <motion.span
                className={styles.eyebrow}
                variants={stagedVariants(heroTimeline.eyebrow, instant)}
                initial="hidden"
                animate="visible"
              >
                {t.hero.exploreThe}
              </motion.span>

              <motion.h1
                className={`${styles.title} ${language === 'id' ? styles.titleId : ''}`}
                variants={stagedVariants(heroTimeline.title, instant)}
                initial="hidden"
                animate="visible"
              >
                {t.hero.titleLine1}
                <br />
                {t.hero.titleLine2}
              </motion.h1>

              <motion.p
                className={styles.description}
                variants={stagedVariants(heroTimeline.description, instant)}
                initial="hidden"
                animate="visible"
              >
                {t.hero.description}
              </motion.p>
            </div>

            <motion.div
              className={styles.actionRow}
              variants={stagedVariants(heroTimeline.actions, instant)}
              initial="hidden"
              animate="visible"
            >
              <Link to="/explore">
                <Button variant="primary" arrow>
                  {t.hero.enterArchiveCta}
                </Button>
              </Link>
              <Link to="/dinosaur/velociraptor-mongoliensis">
                <Button variant="outline">{t.hero.inspectVelociraptorCta}</Button>
              </Link>
            </motion.div>
          </div>

          {/* 3D Exhibition Specimen Layer — emerges from dark behind the type */}
          <div className={styles.viewportLayer} aria-hidden="true">
            <ThreeCanvas
              cameraPosition={[0, 0, 4.8]}
              cameraFov={38}
              fallback={null}
              style={{ width: '100%', height: '100%' }}
            >
              <HeroScene reducedMotion={instant} theme={theme} pointer={pointer} />
            </ThreeCanvas>
          </div>

          {/* Archival Specimen Label */}
          <motion.div
            className={styles.specimenBadge}
            aria-label={t.hero.specimenAriaLabel}
            variants={stagedVariants(heroTimeline.specimen, instant)}
            initial="hidden"
            animate="visible"
          >
            <span className={styles.specimenTag}>{t.hero.specimenTag}</span>
            <span className={styles.specimenName}>Velociraptor mongoliensis</span>
            <span className={styles.specimenMeta}>{t.hero.specimenMeta}</span>
          </motion.div>

          {/* Bottom Stats Ticker */}
          <div className={styles.statsTicker} role="region" aria-label={t.hero.statsAriaLabel}>
            <ArchivalRule
              className={styles.statsRule}
              delay={instant ? 0 : heroTimeline.stats}
              trigger="mount"
            />

            <div className={styles.statItem}>
              <StatCounter
                className={styles.statValue}
                value={t.hero.statErasValue}
                delay={heroTimeline.stats}
                instant={instant}
              />
              <span className={styles.statLabel}>{t.hero.statErasLabel}</span>
              <span className={styles.statDetail}>{t.hero.statErasDetail}</span>
            </div>

            <div className={styles.statItem}>
              <StatCounter
                className={styles.statValue}
                value={t.hero.statSpeciesValue}
                delay={heroTimeline.stats + 0.08}
                instant={instant}
              />
              <span className={styles.statLabel}>{t.hero.statSpeciesLabel}</span>
              <span className={styles.statDetail}>{t.hero.statSpeciesDetail}</span>
            </div>

            <div className={styles.statItem}>
              <StatCounter
                className={styles.statValue}
                value={t.hero.statSpanValue}
                delay={heroTimeline.stats + 0.16}
                instant={instant}
              />
              <span className={styles.statLabel}>{t.hero.statSpanLabel}</span>
              <span className={styles.statDetail}>{t.hero.statSpanDetail}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
