import type { FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Container } from '@/components/ui';
import { DinosaurSummary, RelatedDinosaurs, useDinosaur } from '@/features/dinosaurs';
import { useDocumentTitle } from '@/hooks';
import styles from './DinosaurDetailPage.module.css';

export const DinosaurDetailPage: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { dinosaur, relatedDinosaurs, previousDinosaur, nextDinosaur } = useDinosaur(slug);

  useDocumentTitle(dinosaur ? `${dinosaur.name} — Specimen Archive` : 'Specimen Not Found');

  return (
    <div className={styles.page}>
      <Container maxWidth="1100px">
        <nav className={styles.topNav} aria-label="Archive navigation">
          <Link to="/explore">
            <Button variant="secondary">← Return to Archive</Button>
          </Link>
        </nav>

        {dinosaur ? (
          <>
            <DinosaurSummary dinosaur={dinosaur} />

            {(previousDinosaur || nextDinosaur) && (
              <nav className={styles.specimenPagination} aria-label="Adjacent dinosaur specimens">
                {previousDinosaur && (
                  <Link to={`/dinosaur/${previousDinosaur.slug}`} className={styles.paginationLink}>
                    <span className={styles.paginationDirection}>← Previous Specimen</span>
                    <span className={styles.paginationName}>{previousDinosaur.name}</span>
                  </Link>
                )}

                {nextDinosaur && (
                  <Link
                    to={`/dinosaur/${nextDinosaur.slug}`}
                    className={`${styles.paginationLink} ${styles.paginationLinkNext}`}
                  >
                    <span className={styles.paginationDirection}>Next Specimen →</span>
                    <span className={styles.paginationName}>{nextDinosaur.name}</span>
                  </Link>
                )}
              </nav>
            )}

            <RelatedDinosaurs dinosaurs={relatedDinosaurs} />
          </>
        ) : (
          <section className={styles.notFoundCard} aria-labelledby="specimen-not-found-title">
            <span className={styles.notFoundIcon} aria-hidden="true">
              🦴
            </span>
            <h1 id="specimen-not-found-title" className={styles.notFoundTitle}>
              Specimen Record Not Found
            </h1>
            <p className={styles.notFoundText}>
              This fossil record could not be located in the Mesozoic archive strata. The record
              identifier <code>{slug ?? 'unknown'}</code> may not be documented yet.
            </p>
            <div className={styles.notFoundActions}>
              <Link to="/explore">
                <Button variant="primary">Return to Archive</Button>
              </Link>
              <Link to="/">
                <Button variant="secondary">Exhibition Home</Button>
              </Link>
            </div>
          </section>
        )}
      </Container>
    </div>
  );
};

export default DinosaurDetailPage;
