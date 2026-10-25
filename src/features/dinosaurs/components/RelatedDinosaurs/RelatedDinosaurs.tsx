import type { FC } from 'react';
import type { Dinosaur } from '@/types';
import { DinosaurCard } from '../DinosaurCard';
import styles from './RelatedDinosaurs.module.css';

export interface RelatedDinosaursProps {
  dinosaurs: readonly Dinosaur[];
}

export const RelatedDinosaurs: FC<RelatedDinosaursProps> = ({ dinosaurs }) => {
  if (dinosaurs.length === 0) {
    return null;
  }

  return (
    <section className={styles.relatedSection} aria-labelledby="related-dinosaurs-heading">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Comparative Archive</span>
        <h2 id="related-dinosaurs-heading" className={styles.title}>
          Related Dinosaurs
        </h2>
      </div>

      <div className={styles.grid}>
        {dinosaurs.map((dinosaur) => (
          <DinosaurCard key={dinosaur.id} dinosaur={dinosaur} />
        ))}
      </div>
    </section>
  );
};
