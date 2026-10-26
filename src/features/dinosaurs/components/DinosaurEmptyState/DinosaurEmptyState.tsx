import type { FC } from 'react';
import { Button } from '@/components/ui';
import { useTranslation } from '@/i18n';
import styles from './DinosaurEmptyState.module.css';

export interface DinosaurEmptyStateProps {
  onClearFilters: () => void;
}

export const DinosaurEmptyState: FC<DinosaurEmptyStateProps> = ({ onClearFilters }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyState} role="status">
      <span className={styles.icon} aria-hidden="true">
        🦴
      </span>
      <h2 className={styles.title}>{t.explore.emptyTitle}</h2>
      <p className={styles.description}>{t.explore.emptyDescription}</p>
      <Button variant="secondary" onClick={onClearFilters}>
        {t.explore.clearFilters}
      </Button>
    </div>
  );
};
