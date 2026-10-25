import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui';
import { geologicalPeriods } from '@/data/periods';
import styles from './EraOverview.module.css';

export const EraOverview: FC = () => {
  return (
    <section className={styles.section} aria-labelledby="eras-heading">
      <Container>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Stratigraphic Timeline</span>
          <h2 id="eras-heading" className={styles.title}>
            The Three Eras of the Mesozoic
          </h2>
        </div>

        <div className={styles.eraGrid}>
          {geologicalPeriods.map((period, index) => (
            <Link
              key={period.id}
              to={`/explore?period=${period.id}`}
              className={styles.eraCard}
              aria-label={`Explore ${period.name} Period fossils`}
            >
              <span className={styles.eraIndex}>0{index + 1} // ERA</span>
              <h3 className={styles.eraName}>{period.name}</h3>
              <span className={styles.eraAge}>
                {period.startMya}—{period.endMya} MYA
              </span>
              <p className={styles.eraDescription}>{period.description}</p>
              <span className={styles.eraLink}>Filter {period.name} Archive →</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};
