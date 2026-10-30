import { useEffect, useId, useMemo, useRef, useState, type FC } from 'react';
import { dinosaurs } from '@/data/dinosaurs';
import { searchDinosaurs } from '@/features/dinosaurs/utils';
import { useTranslation } from '@/i18n';
import type { Dinosaur } from '@/types';
import styles from './ComparisonSelector.module.css';

export interface ComparisonSelectorProps {
  /** Slot heading, e.g. "Specimen A". */
  label: string;
  /** Currently selected dinosaur, or null for an empty slot. */
  value: Dinosaur | null;
  /** Ids already used by OTHER slots — these are disabled, not hidden. */
  usedIds: ReadonlySet<string>;
  onChange: (slug: string) => void;
  /** Present on B/C only. */
  onRemove?: () => void;
}

/**
 * Specimen selector for one comparison slot.
 *
 * Native-control-based on purpose: a real `<input>` + `<select>` pair keeps the
 * whole thing keyboard accessible and screen-reader labelled without adding a
 * combobox library. Search filters the option list; disabled options prevent
 * choosing a dinosaur that is already on the plate.
 */
export const ComparisonSelector: FC<ComparisonSelectorProps> = ({
  label,
  value,
  usedIds,
  onChange,
  onRemove,
}) => {
  const { t } = useTranslation();
  const searchId = useId();
  const selectId = useId();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => searchDinosaurs(dinosaurs, query), [query]);

  // Close the suggestion popover on outside click / Escape.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (slug: string): void => {
    onChange(slug);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className={styles.selector} ref={containerRef}>
      <div className={styles.selectorHeader}>
        <label className={styles.slotLabel} htmlFor={selectId}>
          {label}
        </label>
        {onRemove && (
          <button
            type="button"
            className={styles.removeButton}
            onClick={onRemove}
            aria-label={
              value
                ? t.compare.removeSpecimenAria.replace('{name}', value.name)
                : t.compare.removeSpecimen
            }
          >
            {t.compare.removeSpecimen}
            <span aria-hidden="true"> ×</span>
          </button>
        )}
      </div>

      {/* Native select: the accessible, always-works control. */}
      <select
        id={selectId}
        className={styles.nativeSelect}
        value={value?.slug ?? ''}
        onChange={(event) => {
          if (event.target.value) {
            handleSelect(event.target.value);
          }
        }}
      >
        <option value="">{t.compare.selectPlaceholder}</option>
        {dinosaurs.map((dinosaur) => {
          const isUsedElsewhere = usedIds.has(dinosaur.id) && dinosaur.id !== value?.id;
          return (
            <option key={dinosaur.id} value={dinosaur.slug} disabled={isUsedElsewhere}>
              {dinosaur.name}
              {isUsedElsewhere ? ` — ${t.compare.alreadyCompared}` : ''}
            </option>
          );
        })}
      </select>

      {/* Search-assisted picker for quick lookup across 20 records. */}
      <div className={styles.searchRow}>
        <input
          id={searchId}
          type="search"
          className={styles.searchInput}
          placeholder={t.compare.searchPlaceholder}
          aria-label={t.compare.searchAria}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />

        {isOpen && (
          <ul className={styles.suggestionList} role="listbox" aria-label={t.compare.searchAria}>
            {matches.length === 0 && (
              <li className={styles.suggestionEmpty}>{t.compare.noSearchResults}</li>
            )}
            {matches.slice(0, 8).map((dinosaur) => {
              const isUsedElsewhere = usedIds.has(dinosaur.id) && dinosaur.id !== value?.id;
              return (
                <li key={dinosaur.id}>
                  <button
                    type="button"
                    className={styles.suggestionItem}
                    disabled={isUsedElsewhere}
                    onClick={() => handleSelect(dinosaur.slug)}
                  >
                    <span className={styles.suggestionName}>{dinosaur.name}</span>
                    <span className={styles.suggestionMeta}>
                      {isUsedElsewhere
                        ? t.compare.alreadyCompared
                        : `${dinosaur.lengthMeters} m · ${dinosaur.clade}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
