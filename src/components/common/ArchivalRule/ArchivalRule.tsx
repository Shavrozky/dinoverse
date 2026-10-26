import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/hooks';
import { archivalRule } from '@/lib/motion';

export interface ArchivalRuleProps {
  className?: string;
  /** Extra delay in seconds. Keep small — the draw itself is the gesture. */
  delay?: number;
  /** Draw on mount (hero) instead of when scrolled into view (sections). */
  trigger?: 'inView' | 'mount';
}

/**
 * Hairline archival separator that draws itself left-to-right.
 *
 * One of DinoVerse's signature motions. Use sparingly: it marks a genuine
 * section boundary, not every divider.
 */
export const ArchivalRule: FC<ArchivalRuleProps> = ({
  className,
  delay = 0,
  trigger = 'inView',
}) => {
  const prefersReducedMotion = useReducedMotionPreference();

  if (prefersReducedMotion) {
    return <div className={className} aria-hidden="true" />;
  }

  const motionProps =
    trigger === 'mount'
      ? { animate: 'visible' as const }
      : { whileInView: 'visible' as const, viewport: { once: true, amount: 0.6 } as const };

  return (
    <motion.div
      className={className}
      aria-hidden="true"
      style={{ transformOrigin: 'left center' }}
      variants={archivalRule}
      initial="hidden"
      transition={{ delay }}
      {...motionProps}
    />
  );
};
