import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/hooks';
import { motionDistance, motionDurations, motionEasing, revealViewport } from '@/lib/motion';

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Travel distance in px. Defaults to the standard 24px settle. */
  distance?: number;
  /** Extra delay in seconds, for deliberate sequencing. */
  delay?: number;
  /** Fraction of the element that must be visible before revealing. */
  amount?: number;
  /** Render as a section when the reveal owns a landmark. */
  as?: 'div' | 'section' | 'li' | 'header' | 'article';
}

/**
 * Scroll-triggered section reveal.
 *
 * Fades and settles a meaningful block of content once, when roughly a fifth
 * of it is visible. `once: true` is intentional: sections must not replay as
 * the visitor scrolls back up — that is what makes a page feel animated rather
 * than authored. Use it on groups, never on individual paragraphs.
 */
export const Reveal: FC<RevealProps> = ({
  children,
  className,
  distance = motionDistance.reveal,
  delay = 0,
  amount = revealViewport.amount,
  as = 'div',
}) => {
  const prefersReducedMotion = useReducedMotionPreference();

  if (prefersReducedMotion) {
    switch (as) {
      case 'section':
        return <section className={className}>{children}</section>;
      case 'li':
        return <li className={className}>{children}</li>;
      case 'header':
        return <header className={className}>{children}</header>;
      case 'article':
        return <article className={className}>{children}</article>;
      default:
        return <div className={className}>{children}</div>;
    }
  }

  const animation = {
    initial: { opacity: 0, y: distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount },
    transition: { duration: motionDurations.slow, delay, ease: motionEasing.museum },
  } as const;

  switch (as) {
    case 'section':
      return (
        <motion.section className={className} {...animation}>
          {children}
        </motion.section>
      );
    case 'li':
      return (
        <motion.li className={className} {...animation}>
          {children}
        </motion.li>
      );
    case 'header':
      return (
        <motion.header className={className} {...animation}>
          {children}
        </motion.header>
      );
    case 'article':
      return (
        <motion.article className={className} {...animation}>
          {children}
        </motion.article>
      );
    default:
      return (
        <motion.div className={className} {...animation}>
          {children}
        </motion.div>
      );
  }
};
