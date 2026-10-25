import { useId, type FC } from 'react';
import { DINOSAUR_SORT_OPTIONS, SORT_OPTION_LABELS, type DinosaurSortOption } from '../../types';
import styles from './DinosaurSort.module.css';

export interface DinosaurSortProps {
  value: DinosaurSortOption;
  onChange: (value: DinosaurSortOption) => void;
}

export const DinosaurSort: FC<DinosaurSortProps> = ({ value, onChange }) => {
  const selectId = useId();

  return (
    <div className={styles.sortWrapper}>
      <label htmlFor={selectId} className={styles.label}>
        Sort By
      </label>
      <select
        id={selectId}
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value as DinosaurSortOption)}
      >
        {DINOSAUR_SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {SORT_OPTION_LABELS[option]}
          </option>
        ))}
      </select>
    </div>
  );
};
