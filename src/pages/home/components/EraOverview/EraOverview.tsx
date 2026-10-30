import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui';
import { ArchivalRule, Reveal } from '@/components/common';
import { geologicalPeriods } from '@/data/periods';
import { useReducedMotionPreference } from '@/hooks';
import { useTranslation } from '@/i18n';
import { motionEasing, motionStagger } from '@/lib/motion';
import styles from './EraOverview.module.css';

/**
 * 03 — Three Eras of the Mesozoic.
 *
 * The heading and its archival rule reveal together; the three era cards
 * stagger in behind them. Card hover is deliberately CSS-only and the card
 * itself never moves — only the rule draws, the age brightens and the archive
 * link's arrow shifts.
 */
export const EraOverview: FC = () => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotionPreference();

  const cards = geologicalPeriods.map((period, index) => {
    const localizedPeriod = t.periods[period.id];
    const periodName = localizedPeriod?.name ?? period.name;
    const periodDesc = localizedPeriod?.description ?? period.description;
    const ariaLabel = [
      t.home.eraOverview.exploreEraAriaPrefix,
      periodName,
      t.home.eraOverview.exploreEraAriaSuffix,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      id: period.id,
      node: (
        <Link to={`/explore?period=${period.id}`} className={styles.eraCard} aria-label={ariaLabel}>
          {/* Brass rule draws on hover — the card's frame stays put. */}
          <span className={styles.eraRule} aria-hidden="true" />

          <span className={styles.eraIndex}>
            0{index + 1} // {t.home.eraOverview.eraWord}
          </span>
          <h3 className={styles.eraName}>{periodName}</h3>
          <span className={styles.eraAge}>
            {period.startMya}—{period.endMya} {t.home.eraOverview.myaUnit}
          </span>
          <p className={styles.eraDescription}>{periodDesc}</p>
          <span className={styles.eraLink}>
            {t.home.eraOverview.filterLinkPrefix} {periodName} {t.home.eraOverview.filterLinkSuffix}
            <span className={styles.eraArrow} aria-hidden="true">
              →
            </span>
          </span>
        </Link>
      ),
    };
  });

  return (
    <section className={styles.section} aria-labelledby="eras-heading">
      <Container>
        <Reveal className={styles.header}>
          <span className={styles.eyebrow}>{t.home.eraOverview.eyebrow}</span>
          <ArchivalRule className={styles.headerRule} />
          <h2 id="eras-heading" className={styles.title}>
            {t.home.eraOverview.title}
          </h2>
        </Reveal>

        {prefersReducedMotion ? (
          <div className={styles.eraGrid}>
            {cards.map((card) => (
              <div key={card.id}>{card.node}</div>
            ))}
          </div>
        ) : (
          <motion.div
            className={styles.eraGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: motionStagger.wide } },
            }}
          >
            {cards.map((card) => (
              <motion.div
                key={card.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: motionEasing.museum },
                  },
                }}
              >
                {card.node}
              </motion.div>
            ))}
          </motion.div>
        )}
      </Container>
    </section>
  );
};
