import { useId, type FC } from 'react';
import styles from './DinosaurSearch.module.css';

export interface DinosaurSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const DinosaurSearch: FC<DinosaurSearchProps> = ({ value, onChange }) => {
  const inputId = useId();

  return (
    <div className={styles.searchWrapper} role="search">
      <label htmlFor={inputId} className={styles.label}>
        Search Archive
      </label>
      <div className={styles.inputContainer}>
        <span className={styles.searchIcon} aria-hidden="true">
          ⌕
        </span>
        <input
          id={inputId}
          type="search"
          className={styles.input}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search dinosaurs by name, scientific name, clade, or region..."
          autoComplete="off"
          spellCheck={false}
        />
        {value.length > 0 && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => onChange('')}
            aria-label="Clear search query"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
