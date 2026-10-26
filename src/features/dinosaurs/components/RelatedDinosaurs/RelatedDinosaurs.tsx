import type { FC } from 'react';
import { useTranslation } from '@/i18n';
import type { Dinosaur } from '@/types';
import { DinosaurCard } from '../DinosaurCard';
import { StaggeredCards } from '../StaggeredCards';
import styles from './RelatedDinosaurs.module.css';

export interface RelatedDinosaursProps {
  dinosaurs: readonly Dinosaur[];
}

export const RelatedDinosaurs: FC<RelatedDinosaursProps> = ({ dinosaurs }) => {
  const { t } = useTranslation();

  if (dinosaurs.length === 0) {
    return null;
  }

  return (
    <section className={styles.relatedSection} aria-labelledby="related-dinosaurs-heading">
      <div className={styles.header}>
        <span className={styles.eyebrow}>{t.detail.relatedEyebrow}</span>
        <h2 id="related-dinosaurs-heading" className={styles.title}>
          {t.detail.relatedTitle}
        </h2>
      </div>

      <StaggeredCards
        className={styles.grid}
        items={dinosaurs.map((dinosaur) => ({
          id: dinosaur.id,
          node: <DinosaurCard dinosaur={dinosaur} />,
        }))}
      />
    </section>
  );
};
