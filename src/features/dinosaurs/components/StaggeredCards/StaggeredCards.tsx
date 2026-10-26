import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/hooks';
import { motionEasing, motionStagger, staggerDelay } from '@/lib/motion';

export interface StaggeredCardsProps {
  /** One entry per card. Keys are applied by this component. */
  items: readonly { id: string; node: ReactNode }[];
  /** Additional classes for the grid element. */
  className?: string;
  /** Inline layout styles for the grid element. */
  style?: React.CSSProperties;
  /** Reveal when scrolled into view (sections) or immediately on mount (route entry). */
  trigger?: 'inView' | 'mount';
  /** Fraction of the grid that must be visible before it reveals. */
  amount?: number;
}

/**
 * Staggered entrance for a grid of specimen plates.
 *
 * This is the single orchestrator for card entrances across the site — the
 * archive grid, the homepage's curated plates and the related-specimen rail all
 * use it, so cards behave identically everywhere and no card animates itself.
 *
 * The step is small (90ms) and `staggerChildren` is capped by the grid's own
 * children count, so a large filtered archive still finishes arriving within
 * roughly half a second.
 */
export const StaggeredCards: FC<StaggeredCardsProps> = ({
  items,
  className,
  style,
  trigger = 'inView',
  amount = 0.15,
}) => {
  const prefersReducedMotion = useReducedMotionPreference();

  if (prefersReducedMotion) {
    return (
      <div className={className} style={style}>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex' }}>
            {item.node}
          </div>
        ))}
      </div>
    );
  }

  // `mount` reveals immediately (route entry, content already on screen);
  // `inView` reveals as the grid scrolls in, once only.
  const revealProps =
    trigger === 'inView'
      ? ({ whileInView: 'visible', viewport: { once: true, amount } } as const)
      : ({ animate: 'visible' } as const);

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      {...revealProps}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: motionStagger.normal } },
      }}
    >
      {items.map((item, itemIndex) => (
        <motion.div
          key={item.id}
          style={{ display: 'flex' }}
          variants={{
            hidden: { opacity: 0, y: 18 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: motionEasing.museum,
                // Cap the total stagger for large filtered result sets so the
                // grid never takes longer than ~0.5s to finish arriving.
                delay: staggerDelay(itemIndex),
              },
            },
          }}
        >
          {item.node}
        </motion.div>
      ))}
    </motion.div>
  );
};
