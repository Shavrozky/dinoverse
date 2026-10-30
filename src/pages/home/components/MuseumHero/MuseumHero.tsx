import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';

import { ArchivalRule, StatCounter } from '@/components/common';
import { Button, Container } from '@/components/ui';
import { useReducedMotionPreference } from '@/hooks';
import { useTranslation } from '@/i18n';
import {
  heroTimeline,
  motionDistance,
  motionDurations,
  motionEasing,
} from '@/lib/motion';

import { HeroBackgroundVideo } from './HeroBackgroundVideo';
import styles from './MuseumHero.module.css';

/**
 * One step of the hero's staged entrance.
 *
 * The motion remains deliberately restrained:
 * opacity + a small vertical settle only.
 *
 * Reduced-motion users receive the final state immediately.
 */
function stagedVariants(
  delay: number,
  instant: boolean,
): Variants {
  return {
    hidden: {
      opacity: instant ? 1 : 0,
      y: instant ? 0 : motionDistance.settle,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: instant
          ? 0
          : motionDurations.slow,

        delay: instant ? 0 : delay,

        ease: motionEasing.museum,
      },
    },
  };
}

/**
 * Homepage cinematic museum hero.
 *
 * Background:
 * - Brachiosaurus prehistoric-lake video
 * - cinematic scrim
 * - vignette
 *
 * Foreground:
 * - archival label
 * - editorial title
 * - description
 * - CTAs
 * - museum statistics
 *
 * The previous Three.js Velociraptor hero remains available elsewhere
 * in the project but is no longer rendered here.
 */
export const MuseumHero: FC = () => {
  const prefersReducedMotion =
    useReducedMotionPreference();

  const { t, language } = useTranslation();

  const instant = prefersReducedMotion;

  return (
    <section
      className={styles.heroSection}
      aria-label={t.hero.sectionAriaLabel}
    >
      {/* Cinematic prehistoric background */}
      <HeroBackgroundVideo />

      <Container>
        <div className={styles.contentWrapper}>
          {/* Primary editorial typography */}
          <div className={styles.textContent}>
            <motion.div
              className={styles.archiveBadge}
              variants={stagedVariants(
                heroTimeline.badge,
                instant,
              )}
              initial="hidden"
              animate="visible"
            >
              <span
                className={styles.dot}
                aria-hidden="true"
              />

              <span>{t.hero.archiveBadge}</span>
            </motion.div>

            <div className={styles.headlineGroup}>
              <motion.span
                className={styles.eyebrow}
                variants={stagedVariants(
                  heroTimeline.eyebrow,
                  instant,
                )}
                initial="hidden"
                animate="visible"
              >
                {t.hero.exploreThe}
              </motion.span>

              <motion.h1
                className={`${styles.title} ${
                  language === 'id'
                    ? styles.titleId
                    : ''
                }`}
                variants={stagedVariants(
                  heroTimeline.title,
                  instant,
                )}
                initial="hidden"
                animate="visible"
              >
                {t.hero.titleLine1}
                <br />
                {t.hero.titleLine2}
              </motion.h1>

              <motion.p
                className={styles.description}
                variants={stagedVariants(
                  heroTimeline.description,
                  instant,
                )}
                initial="hidden"
                animate="visible"
              >
                {t.hero.description}
              </motion.p>
            </div>

            {/* Hero CTAs */}
            <motion.div
              className={styles.actionRow}
              variants={stagedVariants(
                heroTimeline.actions,
                instant,
              )}
              initial="hidden"
              animate="visible"
            >
              <Link to="/explore">
                <Button
                  variant="primary"
                  arrow
                >
                  {t.hero.enterArchiveCta}
                </Button>
              </Link>

              <Link to="/dinosaur/velociraptor-mongoliensis">
                <Button variant="outline">
                  {t.hero.inspectVelociraptorCta}
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Bottom museum statistics */}
          <div
            className={styles.statsTicker}
            role="region"
            aria-label={t.hero.statsAriaLabel}
          >
            <ArchivalRule
              className={styles.statsRule}
              delay={
                instant
                  ? 0
                  : heroTimeline.stats
              }
              trigger="mount"
            />

            <div className={styles.statItem}>
              <StatCounter
                className={styles.statValue}
                value={t.hero.statErasValue}
                delay={heroTimeline.stats}
                instant={instant}
              />

              <span className={styles.statLabel}>
                {t.hero.statErasLabel}
              </span>

              <span className={styles.statDetail}>
                {t.hero.statErasDetail}
              </span>
            </div>

            <div className={styles.statItem}>
              <StatCounter
                className={styles.statValue}
                value={t.hero.statSpeciesValue}
                delay={
                  heroTimeline.stats + 0.08
                }
                instant={instant}
              />

              <span className={styles.statLabel}>
                {t.hero.statSpeciesLabel}
              </span>

              <span className={styles.statDetail}>
                {t.hero.statSpeciesDetail}
              </span>
            </div>

            <div className={styles.statItem}>
              <StatCounter
                className={styles.statValue}
                value={t.hero.statSpanValue}
                delay={
                  heroTimeline.stats + 0.16
                }
                instant={instant}
              />

              <span className={styles.statLabel}>
                {t.hero.statSpanLabel}
              </span>

              <span className={styles.statDetail}>
                {t.hero.statSpanDetail}
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};