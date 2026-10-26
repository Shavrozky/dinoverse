import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui';
import { Reveal } from '@/components/common';
import { useDocumentTitle, useReducedMotionPreference } from '@/hooks';
import { useTranslation } from '@/i18n';
import { motionEasing } from '@/lib/motion';
import styles from './ComparePage.module.css';

/**
 * Scale comparison.
 *
 * The archive does not yet ship a curated comparison set, so this page keeps
 * its honest "curation in progress" state — no fabricated silhouettes or
 * invented dimensions. Motion here is limited to the entrance of the header and
 * the placeholder plaque; the dashed frame simply settles into place once.
 */
export const ComparePage: FC = () => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotionPreference();
  useDocumentTitle(t.compare.documentTitle);

  return (
    <div className={styles.page}>
      <Container>
        <Reveal as="header" className={styles.header}>
          <span className={styles.eyebrow}>{t.compare.eyebrow}</span>
          <h1 className={styles.title}>{t.compare.title}</h1>
          <p className={styles.subtitle}>{t.compare.subtitle}</p>
        </Reveal>

        <motion.div
          className={styles.placeholder}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: motionEasing.museum }}
        >
          <span className={styles.placeholderIcon} aria-hidden="true">
            🦕 🧍 🦖
          </span>
          <h2 className={styles.curationTitle}>{t.compare.curationTitle}</h2>
          <p className={styles.curationText}>{t.compare.curationDescription}</p>
        </motion.div>
      </Container>
    </div>
  );
};

export default ComparePage;
