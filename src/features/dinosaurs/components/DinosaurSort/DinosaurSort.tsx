import { useId, type FC } from 'react';
import { formatLocalizedSortOption, useTranslation } from '@/i18n';
import { DINOSAUR_SORT_OPTIONS, type DinosaurSortOption } from '../../types';
import styles from './DinosaurSort.module.css';

export interface DinosaurSortProps {
  value: DinosaurSortOption;
  onChange: (value: DinosaurSortOption) => void;
}

export const DinosaurSort: FC<DinosaurSortProps> = ({ value, onChange }) => {
  const selectId = useId();
  const { t, language } = useTranslation();

  return (
    <div className={styles.sortWrapper}>
      <label htmlFor={selectId} className={styles.label}>
        {t.explore.sortByLabel}
      </label>
      <select
        id={selectId}
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value as DinosaurSortOption)}
      >
        {DINOSAUR_SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {formatLocalizedSortOption(option, language)}
          </option>
        ))}
      </select>
    </div>
  );
};
