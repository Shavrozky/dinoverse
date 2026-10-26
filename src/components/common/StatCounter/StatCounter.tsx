import { useEffect, useRef, type FC } from 'react';
import { animate } from 'framer-motion';
import { motionEasing } from '@/lib/motion';

export interface StatCounterProps {
  /** Localized stat string, e.g. "03", "20", "186M", "186Jt". */
  value: string;
  /** Delay before the count begins, in seconds. */
  delay?: number;
  /** Skip the count and show the final value immediately. */
  instant?: boolean;
  className?: string;
}

/**
 * Museum statistics count-up.
 *
 * Runs once, on mount, and writes straight to the DOM node — no React state,
 * so a 60fps count costs zero re-renders. Digits are zero-padded to the width
 * of the localised value ("00 → 03", "000 → 186M") so the element keeps its
 * measured width and the count causes no layout shift.
 *
 * The duration is short and the curve decelerates hard, so it reads as an
 * archival instrument settling rather than a SaaS dashboard metric.
 *
 * Note: this always renders the authoritative `value` into the DOM. The count
 * is pure decoration layered on top, so screen readers and no-JS states still
 * get the real number.
 */
export const StatCounter: FC<StatCounterProps> = ({ value, delay = 0, instant = false, className }) => {
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = valueRef.current;
    if (!node) {
      return;
    }

    const match = /^(\D*)(\d+)(.*)$/.exec(value);
    if (instant || !match) {
      node.textContent = value;
      return;
    }

    const prefix = match[1];
    const digits = match[2];
    const suffix = match[3];
    const target = Number(digits);
    const width = digits.length;

    node.textContent = `${prefix}${'0'.repeat(width)}${suffix}`;

    const controls = animate(0, target, {
      duration: 0.9,
      delay,
      ease: motionEasing.museum,
      onUpdate: (latest: number) => {
        const rounded = String(Math.round(latest)).padStart(width, '0');
        node.textContent = `${prefix}${rounded}${suffix}`;
      },
      onComplete: () => {
        // Land exactly on the localised string, preserving real formatting.
        node.textContent = value;
      },
    });

    return () => controls.stop();
    // Deliberately keyed on value/delay/instant only: re-running on every
    // render would restart the count mid-animation.
  }, [value, delay, instant]);

  return (
    <span ref={valueRef} className={className}>
      {value}
    </span>
  );
};
