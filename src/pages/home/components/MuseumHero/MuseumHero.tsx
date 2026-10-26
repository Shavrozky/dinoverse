import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Button, Container } from '@/components/ui';
import { ThreeCanvas } from '@/three/components';
import { HeroScene } from '@/three/scenes';
import styles from './MuseumHero.module.css';

export const MuseumHero: FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={styles.heroSection} aria-label="Museum Hero Exhibition">
      <Container>
        <motion.div
          className={styles.contentWrapper}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {/* Primary Editorial Typography & CTAs */}
          <div className={styles.textContent}>
            <div className={styles.archiveBadge}>
              <span className={styles.dot} />
              <span>Digital Paleontology Archive // Vol. 01</span>
            </div>

            <div className={styles.headlineGroup}>
              <span className={styles.eyebrow}>Explore The</span>
              <h1 className={styles.title}>
                Mesozoic
                <br />
                World
              </h1>
              <p className={styles.description}>
                An interactive paleontology exhibition documenting prehistoric life across the
                Triassic, Jurassic, and Cretaceous periods through 3D holotypes and anatomical
                records.
              </p>
            </div>

            <div className={styles.actionRow}>
              <Link to="/explore">
                <Button variant="primary">Enter The Archive →</Button>
              </Link>
              <Link to="/dinosaur/velociraptor-mongoliensis">
                <Button variant="outline">Inspect Velociraptor</Button>
              </Link>
            </div>
          </div>

          {/* 3D Exhibition Specimen Layer */}
          <div className={styles.viewportLayer} aria-hidden="true">
            <ThreeCanvas
              cameraPosition={[0, 0, 4.8]}
              cameraFov={38}
              fallback={null}
              style={{ width: '100%', height: '100%' }}
            >
              <HeroScene reducedMotion={Boolean(prefersReducedMotion)} />
            </ThreeCanvas>
          </div>

          {/* Archival Specimen Label */}
          <div className={styles.specimenBadge} aria-label="Hero Specimen Identification">
            <span className={styles.specimenTag}>Specimen // Holotype</span>
            <span className={styles.specimenName}>Velociraptor mongoliensis</span>
            <span className={styles.specimenMeta}>Dromaeosauridae • Late Cretaceous</span>
          </div>

          {/* Bottom Stats Ticker */}
          <div className={styles.statsTicker} role="region" aria-label="Archive Statistics">
            <div className={styles.statItem}>
              <span className={styles.statValue}>03</span>
              <span className={styles.statLabel}>Mesozoic Eras</span>
              <span className={styles.statDetail}>Triassic • Jurassic • Cretaceous</span>
            </div>

            <div className={styles.statItem}>
              <span className={styles.statValue}>20</span>
              <span className={styles.statLabel}>Documented Species</span>
              <span className={styles.statDetail}>Theropods, Sauropods, & Ceratopsians</span>
            </div>

            <div className={styles.statItem}>
              <span className={styles.statValue}>186M</span>
              <span className={styles.statLabel}>Geological Span</span>
              <span className={styles.statDetail}>252 to 66 Million Years Ago</span>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
