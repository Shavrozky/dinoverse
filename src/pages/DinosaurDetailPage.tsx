import type { FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Container } from '@/components/ui';
import { useReducedMotionPreference } from '@/hooks';
import { DinosaurSummary, RelatedDinosaurs, useDinosaur } from '@/features/dinosaurs';
import { useDocumentTitle } from '@/hooks';
import { useTranslation } from '@/i18n';
import { motionEasing, motionStagger } from '@/lib/motion';
import styles from './DinosaurDetailPage.module.css';

/**
 * Museum exhibit entrance for /dinosaur/:slug.
 *
 * Sequence: specimen label → species title → scientific name → 3D viewport →
 * metrics → description → related specimens.
 *
 * The whole reveal is bounded well under 1.2s: four steps at a 70ms stagger plus
 * a 0.6s settle. Nothing here waits on the GLB — the viewport frame arrives
 * immediately and the model fades up inside it once loaded (see DinosaurViewer),
 * so a slow network never blocks the page from being readable.
 */
export const DinosaurDetailPage: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { dinosaur, relatedDinosaurs, previousDinosaur, nextDinosaur } = useDinosaur(slug);
  const prefersReducedMotion = useReducedMotionPreference();

  useDocumentTitle(
    dinosaur ? `${dinosaur.name} — ${t.detail.documentTitleSuffix}` : t.detail.notFoundDocumentTitle
  );

  const reveal = (index: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.55,
            delay: index * motionStagger.tight,
            ease: motionEasing.museum,
          },
        };

  return (
    <div className={styles.page}>
      <Container maxWidth="1100px">
        <nav className={styles.topNav} aria-label={t.detail.archiveNavAria}>
          <Link to="/explore">
            <Button variant="secondary">{t.detail.returnToArchive}</Button>
          </Link>
        </nav>

        {dinosaur ? (
          <>
            <motion.div {...reveal(0)}>
              <DinosaurSummary dinosaur={dinosaur} />
            </motion.div>

            {(previousDinosaur || nextDinosaur) && (
              <motion.nav
                className={styles.specimenPagination}
                aria-label={t.detail.adjacentNavAria}
                {...reveal(2)}
              >
                {previousDinosaur && (
                  <Link to={`/dinosaur/${previousDinosaur.slug}`} className={styles.paginationLink}>
                    <span className={styles.paginationDirection}>{t.detail.previousSpecimen}</span>
                    <span className={styles.paginationName}>{previousDinosaur.name}</span>
                  </Link>
                )}

                {nextDinosaur && (
                  <Link
                    to={`/dinosaur/${nextDinosaur.slug}`}
                    className={`${styles.paginationLink} ${styles.paginationLinkNext}`}
                  >
                    <span className={styles.paginationDirection}>{t.detail.nextSpecimen}</span>
                    <span className={styles.paginationName}>{nextDinosaur.name}</span>
                  </Link>
                )}
              </motion.nav>
            )}

            <RelatedDinosaurs dinosaurs={relatedDinosaurs} />
          </>
        ) : (
          <motion.section
            className={styles.notFoundCard}
            aria-labelledby="specimen-not-found-title"
            {...reveal(0)}
          >
            <span className={styles.notFoundIcon} aria-hidden="true">
              🦴
            </span>
            <h1 id="specimen-not-found-title" className={styles.notFoundTitle}>
              {t.detail.notFoundTitle}
            </h1>
            <p className={styles.notFoundText}>
              {t.detail.notFoundTextPrefix} <code>{slug ?? 'unknown'}</code>{' '}
              {t.detail.notFoundTextSuffix}
            </p>
            <div className={styles.notFoundActions}>
              <Link to="/explore">
                <Button variant="primary">{t.detail.returnToArchivePlain}</Button>
              </Link>
              <Link to="/">
                <Button variant="secondary">{t.detail.exhibitionHome}</Button>
              </Link>
            </div>
          </motion.section>
        )}
      </Container>
    </div>
  );
};

export default DinosaurDetailPage;
