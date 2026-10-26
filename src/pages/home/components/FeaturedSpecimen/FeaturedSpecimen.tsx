import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container } from '@/components/ui';
import { tyrannosaurusRex } from '@/data/dinosaurs/tyrannosaurus-rex';
import { preloadDinosaurModel } from '@/three/loaders';
import styles from './FeaturedSpecimen.module.css';

export const FeaturedSpecimen: FC = () => {
  const dino = tyrannosaurusRex;
  const handlePreload = () => preloadDinosaurModel(dino.modelPath);

  return (
    <section className={styles.section} aria-labelledby="featured-specimen-heading">
      <Container>
        <div className={styles.innerGrid}>
          <div className={styles.infoColumn}>
            <div className={styles.specimenHeader}>
              <span className={styles.specimenCode}>SPECIMEN 001 // EXHIBIT FOCUS</span>
              <span className={styles.clade}>{dino.clade}</span>
            </div>

            <div className={styles.nameGroup}>
              <h2 id="featured-specimen-heading" className={styles.commonName}>
                Tyrannosaurus
              </h2>
              <span className={styles.scientificName}>{dino.scientificName}</span>
            </div>

            <p className={styles.description}>{dino.description}</p>

            <div className={styles.metricsGrid}>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Geological Age</span>
                <span className={styles.metricValue}>68—66 MYA</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Total Length</span>
                <span className={styles.metricValue}>12.3 M</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Estimated Mass</span>
                <span className={styles.metricValue}>~8.4 Tonnes</span>
              </div>
            </div>

            <div>
              <Link
                to={`/dinosaur/${dino.slug}`}
                onPointerEnter={handlePreload}
                onFocus={handlePreload}
              >
                <Button variant="secondary">Examine Specimen Record →</Button>
              </Link>
            </div>
          </div>

          <div className={styles.visualColumn} aria-hidden="true">
            <div className={styles.visualAtmosphere} />
            <span className={styles.visualBadge}>LATE CRETACEOUS APEX</span>
            <span className={styles.monogramLarge}>T.r.</span>
            <span className={styles.visualFootnote}>HELL CREEK FORMATION // NORTH AMERICA</span>
          </div>
        </div>
      </Container>
    </section>
  );
};
