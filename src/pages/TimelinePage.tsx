import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui';
import { Reveal } from '@/components/common';
import { geologicalPeriods } from '@/data/periods';
import { useDocumentTitle, useReducedMotionPreference } from '@/hooks';
import { useTranslation } from '@/i18n';
import { motionEasing, motionStagger } from '@/lib/motion';
import styles from './TimelinePage.module.css';

/**
 * Timeline.
 *
 * Motion is chronological and informational only: the vertical spine draws
 * downward once, then era markers reveal in order. There is no scroll
 * hijacking — the browser scrolls normally and the spine simply draws when the
 * timeline enters view.
 */
export const TimelinePage: FC = () => {
  const { t, language } = useTranslation();
  const prefersReducedMotion = useReducedMotionPreference();
  useDocumentTitle(t.timeline.documentTitle);

  return (
    <div className={styles.page}>
      <Container>
        <Reveal as="header" className={styles.header}>
          <span className={styles.eyebrow}>{t.timeline.eyebrow}</span>
          <h1 className={styles.title}>{t.timeline.title}</h1>
          <p className={styles.subtitle}>{t.timeline.subtitle}</p>
        </Reveal>

        <div className={styles.timeline}>
          {/* Archival spine: draws top-to-bottom once, on entry. */}
          {!prefersReducedMotion && (
            <motion.div
              className={styles.spine}
              aria-hidden="true"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.9, ease: motionEasing.museum }}
            />
          )}

          <motion.div
            className={styles.eraList}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView={prefersReducedMotion ? undefined : 'visible'}
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: motionStagger.wide } },
            }}
          >
            {geologicalPeriods.map((period, index) => {
              const localizedPeriod = t.periods[period.id];
              const periodName = localizedPeriod?.name ?? period.name;
              const periodDesc = localizedPeriod?.description ?? period.description;
              const headingText =
                language === 'id'
                  ? `${t.timeline.periodHeadingSuffix} ${periodName}`
                  : `${periodName} ${t.timeline.periodHeadingSuffix}`;

              return (
                <motion.div
                  key={period.id}
                  className={styles.eraRow}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: motionEasing.museum },
                    },
                  }}
                >
                  <span className={styles.marker} aria-hidden="true" />

                  <Link to={`/explore?period=${period.id}`} className={styles.eraCard}>
                    <div className={styles.eraMeta}>
                      <span>
                        0{index + 1} // {t.timeline.eraWord}
                      </span>
                      <span className={styles.eraAge}>
                        {period.startMya}—{period.endMya} {t.timeline.myaUnit}
                      </span>
                    </div>
                    <h2 className={styles.eraHeading}>{headingText}</h2>
                    <p className={styles.eraDescription}>{periodDesc}</p>
                    <span className={styles.eraLink}>
                      {t.timeline.viewSpecimensPrefix} {periodName} {t.timeline.viewSpecimensSuffix}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default TimelinePage;
