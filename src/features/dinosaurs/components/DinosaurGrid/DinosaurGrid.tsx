import type { FC } from 'react';
import type { Dinosaur } from '@/types';
import { DinosaurCard } from '../DinosaurCard';
import styles from './DinosaurGrid.module.css';

export interface DinosaurGridProps {
  dinosaurs: readonly Dinosaur[];
}

export const DinosaurGrid: FC<DinosaurGridProps> = ({ dinosaurs }) => {
  return (
    <div className={styles.grid}>
      {dinosaurs.map((dinosaur, index) => (
        <DinosaurCard key={dinosaur.id} dinosaur={dinosaur} specimenIndex={index + 1} />
      ))}
    </div>
  );
};
