import type { FC } from 'react';
import type { Dinosaur } from '@/types';
import { DinosaurCard } from '../DinosaurCard';
import { StaggeredCards } from '../StaggeredCards';
import styles from './DinosaurGrid.module.css';

export interface DinosaurGridProps {
  dinosaurs: readonly Dinosaur[];
}

export const DinosaurGrid: FC<DinosaurGridProps> = ({ dinosaurs }) => {
  return (
    <StaggeredCards
      className={styles.grid}
      items={dinosaurs.map((dinosaur, index) => ({
        id: dinosaur.id,
        node: <DinosaurCard dinosaur={dinosaur} specimenIndex={index + 1} />,
      }))}
    />
  );
};
