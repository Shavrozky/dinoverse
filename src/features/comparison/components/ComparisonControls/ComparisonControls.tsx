import { useCallback, useEffect, useState, type FC } from 'react';
import { useTranslation } from '@/i18n';
import styles from './ComparisonControls.module.css';

export interface ComparisonControlsProps {
  showHuman: boolean;
  onToggleHuman: (show: boolean) => void;
  onSwap: () => void;
  canSwap: boolean;
}

type CopyState = 'idle' | 'copied' | 'failed';

/**
 * Utility rail for the comparison plate: human reference toggle, slot swap and
 * a share link.
 *
 * Deliberately low-key — very low motion density per the museum motion
 * hierarchy. The copy control degrades honestly: if the Clipboard API is
 * unavailable or denied, it reports failure and points the visitor at the URL
 * rather than pretending it worked.
 */
export const ComparisonControls: FC<ComparisonControlsProps> = ({
  showHuman,
  onToggleHuman,
  onSwap,
  canSwap,
}) => {
  const { t } = useTranslation();
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // Reset the "copied" confirmation so the control returns to its resting label.
  useEffect(() => {
    if (copyState === 'idle') {
      return;
    }
    const timer = window.setTimeout(() => setCopyState('idle'), 2200);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const handleCopy = useCallback(async () => {
    const url = window.location.href;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(url);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }, []);

  const copyLabel =
    copyState === 'copied'
      ? t.compare.copyLinkCopied
      : copyState === 'failed'
        ? t.compare.copyLinkFailed
        : t.compare.copyLink;

  return (
    <div className={styles.controls}>
      <div className={styles.toggleGroup}>
        <button
          type="button"
          role="switch"
          aria-checked={showHuman}
          onClick={() => onToggleHuman(!showHuman)}
          className={`${styles.toggle} ${showHuman ? styles.toggleOn : ''}`}
          title={t.compare.humanToggleHint}
        >
          <span className={styles.toggleTrack} aria-hidden="true">
            <span className={styles.toggleThumb} />
          </span>
          <span className={styles.toggleLabel}>{t.compare.humanToggle}</span>
        </button>
        <span className={styles.hint}>{t.compare.humanToggleHint}</span>
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={onSwap}
          disabled={!canSwap}
          aria-label={t.compare.swapAria}
        >
          {t.compare.swap}
        </button>

        <button
          type="button"
          className={`${styles.actionButton} ${copyState !== 'idle' ? styles.actionButtonActive : ''}`}
          onClick={handleCopy}
          aria-label={t.compare.copyLinkAria}
          aria-live="polite"
        >
          {copyLabel}
        </button>
      </div>
    </div>
  );
};
