import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui';
import { Reveal } from '@/components/common';
import {
  ComparisonControls,
  ComparisonInsights,
  ComparisonSelector,
  ComparisonStage,
  ComparisonStats,
  MAX_COMPARISON_SPECIMENS,
  buildStagedSpecimens,
  calculateComparisonScale,
  useComparison,
} from '@/features/comparison';
import { useDocumentTitle, useReducedMotionPreference } from '@/hooks';
import { useTranslation } from '@/i18n';
import { motionEasing, motionStagger } from '@/lib/motion';
import { useStageWidth } from './useStageWidth';
import styles from './ComparePage.module.css';

/**
 * Fixed vertical budget for the stage, in px.
 *
 * Deliberately a constant rather than a measurement: stage height is a product
 * of the scale engine, so measuring it would feed the plate's own output back
 * into the calculation. 340px keeps a 15 m sauropod readable without letting a
 * single huge specimen dominate the page.
 */
const STAGE_HEIGHT_BUDGET = 340;

/**
 * Interactive true-scale comparison.
 *
 * The whole page derives from the URL (`?a=&b=&c=&human=`), so a comparison is
 * shareable, survives refresh, and answers Back/Forward correctly. Zustand is
 * deliberately not involved: that store is reserved for app-wide preferences.
 *
 * Everything below the header is computed from canonical dinosaur records — no
 * measurement is invented, and missing data is surfaced honestly.
 */
export const ComparePage: FC = () => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotionPreference();
  useDocumentTitle(t.compare.documentTitle);

  const {
    state,
    canAddSpecimen,
    canRemoveSpecimen,
    setSlot,
    addSpecimen,
    removeSlot,
    swapSlots,
    setShowHuman,
  } = useComparison();

  const { ref: stageRef, width: stageWidth } = useStageWidth();

  const specimens = state.specimens;

  // One shared scale for every body on the plate.
  const scale = calculateComparisonScale({
    specimens,
    showHuman: state.showHuman,
    availableWidth: stageWidth,
    availableHeight: STAGE_HEIGHT_BUDGET,
  });

  const staged = buildStagedSpecimens(specimens, scale.pixelsPerMeter, state.showHuman);
  const usedIds = new Set(specimens.map((entry) => entry.id));
  const slotLabels = [t.compare.slotA, t.compare.slotB, t.compare.slotC];

  const reveal = (index: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.5,
            delay: index * motionStagger.tight,
            ease: motionEasing.museum,
          },
        };

  // Slots to render: filled specimens, plus one empty "add" slot while there is
  // room for another dinosaur.
  const visibleSlotCount = Math.min(
    specimens.length + (canAddSpecimen ? 1 : 0),
    MAX_COMPARISON_SPECIMENS
  );

  return (
    <div className={styles.page}>
      <Container>
        <Reveal as="header" className={styles.header}>
          <span className={styles.eyebrow}>{t.compare.eyebrow}</span>
          <h1 className={styles.title}>{t.compare.title}</h1>
          <p className={styles.subtitle}>{t.compare.subtitle}</p>
          {state.hadInvalidInput && (
            <p className={styles.invalidNotice} role="status">
              {t.compare.invalidNotice}
            </p>
          )}
        </Reveal>

        {/* --- Selector rail ------------------------------------------------ */}
        <motion.section
          className={styles.selectorRail}
          aria-label={t.compare.specimenLabel}
          {...reveal(0)}
        >
          {Array.from({ length: visibleSlotCount }).map((_, index) => {
            const current: (typeof specimens)[number] | null = specimens[index] ?? null;
            const isAddSlot = current === null;

            return (
              <ComparisonSelector
                key={`slot-${index}`}
                label={slotLabels[index] ?? t.compare.specimenLabel}
                value={current}
                usedIds={usedIds}
                onChange={(slug) => (isAddSlot ? addSpecimen(slug) : setSlot(index, slug))}
                onRemove={!isAddSlot && canRemoveSpecimen ? () => removeSlot(index) : undefined}
              />
            );
          })}
        </motion.section>

        <motion.div {...reveal(1)}>
          <ComparisonControls
            showHuman={state.showHuman}
            onToggleHuman={setShowHuman}
            onSwap={swapSlots}
            canSwap={specimens.length >= 2}
          />
        </motion.div>

        {/* --- True-scale stage -------------------------------------------- */}
        <motion.div {...reveal(2)}>
          <div ref={stageRef} className={styles.stageMeasure}>
            <ComparisonStage specimens={staged} scale={scale} showHuman={state.showHuman} />
          </div>
        </motion.div>

        {/* --- Derived insights -------------------------------------------- */}
        <Reveal delay={0.06}>
          <ComparisonInsights specimens={specimens} />
        </Reveal>

        {/* --- Measurement plate ------------------------------------------- */}
        <Reveal delay={0.1}>
          <ComparisonStats specimens={specimens} />
        </Reveal>
      </Container>
    </div>
  );
};

export default ComparePage;
