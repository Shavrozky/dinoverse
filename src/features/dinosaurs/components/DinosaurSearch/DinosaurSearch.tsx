import { useId, type FC } from 'react';
import { useTranslation } from '@/i18n';
import styles from './DinosaurSearch.module.css';

export interface DinosaurSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const DinosaurSearch: FC<DinosaurSearchProps> = ({ value, onChange }) => {
  const inputId = useId();
  const { t } = useTranslation();

  return (
    <div className={styles.searchWrapper} role="search">
      <label htmlFor={inputId} className={styles.label}>
        {t.explore.searchLabel}
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
          placeholder={t.explore.searchPlaceholder}
          autoComplete="off"
          spellCheck={false}
        />
        {value.length > 0 && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => onChange('')}
            aria-label={t.explore.clearSearchAria}
            title={t.explore.clearSearchTitle}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
