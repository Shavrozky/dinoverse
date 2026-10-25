import type { FC } from 'react';
import { Button } from '@/components/ui';
import styles from './DinosaurEmptyState.module.css';

export interface DinosaurEmptyStateProps {
  onClearFilters: () => void;
}

export const DinosaurEmptyState: FC<DinosaurEmptyStateProps> = ({ onClearFilters }) => {
  return (
    <div className={styles.emptyState} role="status">
      <span className={styles.icon} aria-hidden="true">
        🦴
      </span>
      <h2 className={styles.title}>No dinosaurs found</h2>
      <p className={styles.description}>
        No specimens in the archive match your current search or filter criteria. Try changing your
        search or removing some filters.
      </p>
      <Button variant="secondary" onClick={onClearFilters}>
        Clear filters
      </Button>
    </div>
  );
};
