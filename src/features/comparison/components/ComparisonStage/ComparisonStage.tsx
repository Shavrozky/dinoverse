import { useEffect, useLayoutEffect, useRef, useState, type FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/hooks';
import { interpolate } from '@/i18n/interpolate';
import { useTranslation } from '@/i18n';
import { motionEasing } from '@/lib/motion';
import type { ComparisonScale, StagedSpecimen } from '../../types/comparison';
import { buildRulerTicks } from '../../utils/comparisonScale';
import { SpecimenSilhouette } from '../SpecimenSilhouette';
import styles from './ComparisonStage.module.css';

export interface ComparisonStageProps {
  specimens: StagedSpecimen[];
  scale: ComparisonScale;
  showHuman: boolean;
}

/** Width of the left-hand label gutter, in px. */
const LABEL_GUTTER_PX = 132;
/** Height of the ruler strip beneath the ground line, in px. */
const RULER_HEIGHT_PX = 44;

/**
 * True-scale comparison stage.
 *
 * Every body is positioned on ONE shared ground line and sized by the same
 * `pixelsPerMeter`, so the visual comparison is literally proportional to the
 * canonical measurements. Nothing is individually fit to a slot.
 *
 * Layout model:
 * - The stage is a fixed-size box whose width/height come straight from the
 *   scale engine (which in turn comes from the specimens' real dimensions).
 * - When that honest width exceeds the viewport, ONLY this element scrolls
 *   horizontally. The page itself never scrolls sideways.
 * - Bodies are laid out left-to-right with their bases on the same baseline;
 *   the human reference is always drawn last as a yardstick.
 *
 * Scale changes (e.g. Velociraptor → Argentinosaurus) re-derive the box and the
 * bodies animate to their new width/height rather than remounting, so the plate
 * reads as a measurement being re-taken.
 */
export const ComparisonStage: FC<ComparisonStageProps> = ({ specimens, scale, showHuman }) => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotionPreference();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [announced, setAnnounced] = useState('');

  const ticks = buildRulerTicks(scale);
  const scaleNote = interpolate(t.compare.stageScaleNote, {
    interval: trimMeters(scale.rulerIntervalMeters),
  });

  // Reset horizontal scroll to the ground origin when the comparison changes
  // shape — the visitor should always start reading from 0 m.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollLeft = 0;
    }
  }, [specimens.length, scale.stageWidthPx]);

  // Keep the stage announced textually so the comparison never depends solely
  // on the drawing.
  useLayoutEffect(() => {
    const summary = specimens
      .map((specimen) =>
        specimen.kind === 'human'
          ? `${specimen.label}: ${specimen.lengthMeters} m`
          : `${specimen.label}: ${specimen.lengthMeters} m long${
              specimen.heightIsDocumented && specimen.heightMeters
                ? `, ${specimen.heightMeters} m tall`
                : ''
            }`
      )
      .join('. ');
    setAnnounced(summary);
  }, [specimens]);

  const groundOffsetPx = RULER_HEIGHT_PX;

  return (
    <section className={styles.stageSection} aria-label={t.compare.stageAriaLabel}>
      <header className={styles.stageHeader}>
        <div>
          <span className={styles.stageEyebrow}>{t.compare.eyebrow}</span>
          <h2 className={styles.stageTitle}>{t.compare.stageTitle}</h2>
        </div>
        <div className={styles.stageMeta}>
          <span className={styles.scaleNote}>{scaleNote}</span>
          <span className={styles.conventionNote}>{t.compare.scaleConventionNote}</span>
        </div>
      </header>

      {/* Textual equivalent of the visual plate. Visually hidden, not display:none. */}
      <p className={styles.visuallyHidden}>{announced}</p>

      <div
        ref={scrollRef}
        className={styles.scrollViewport}
        // The viewport is always horizontally scrollable by CSS; giving it a
        // focusable group role means keyboard users can pan a 33 m plate with
        // the arrow keys instead of being stuck at the left edge.
        tabIndex={0}
        role="group"
        aria-label={t.compare.stageAriaLabel}
      >
        <div
          className={styles.plate}
          style={{
            width: `${scale.stageWidthPx + LABEL_GUTTER_PX}px`,
            height: `${scale.stageHeightPx + groundOffsetPx}px`,
          }}
        >
          {/* Measurement rule: thin archival ticks, never graph paper. */}
          <div className={styles.rulerLayer} aria-hidden="true">
            <div
              className={styles.rulerLine}
              style={{
                left: `${LABEL_GUTTER_PX}px`,
                width: `${scale.rulerMaxMeters * scale.pixelsPerMeter}px`,
              }}
            />
            {ticks.map((meter) => {
              const left = LABEL_GUTTER_PX + meter * scale.pixelsPerMeter;
              const isMajor = meter % (scale.rulerIntervalMeters * 2) === 0;
              return (
                <div key={meter} className={styles.tickWrap} style={{ left: `${left}px` }}>
                  <span className={isMajor ? styles.tickMajor : styles.tickMinor} />
                  <span className={isMajor ? styles.tickLabelMajor : styles.tickLabel}>
                    {formatTick(meter)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Ground line shared by every body. */}
          <div
            className={styles.groundLine}
            style={{ left: `${LABEL_GUTTER_PX}px`, bottom: `${groundOffsetPx}px` }}
            aria-hidden="true"
          />

          {/* Bodies, all standing on that single baseline. */}
          <div
            className={styles.bodies}
            style={{
              left: `${LABEL_GUTTER_PX}px`,
              bottom: `${groundOffsetPx}px`,
              gap: `${Math.round(scale.pixelsPerMeter * 0.6)}px`,
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {specimens.map((specimen) => (
                <motion.div
                  key={specimen.id}
                  className={`${styles.bodySlot} ${
                    specimen.kind === 'human' ? styles.humanSlot : ''
                  }`}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.45,
                    ease: motionEasing.museum,
                  }}
                  layout={prefersReducedMotion ? false : 'position'}
                >
                  <div className={styles.bodyInner}>
                    <SpecimenSilhouette
                      kind={specimen.silhouette}
                      widthPx={specimen.widthPx}
                      heightPx={specimen.heightPx}
                      className={
                        specimen.kind === 'human' ? styles.humanSilhouette : styles.dinoSilhouette
                      }
                    />
                  </div>

                  <div className={styles.bodyLabel}>
                    <span className={styles.bodyName}>
                      {specimen.kind === 'human' ? t.compare.humanLabel : specimen.label}
                    </span>
                    <span className={styles.bodyDims}>
                      {trimMeters(specimen.lengthMeters)} m
                      {specimen.kind === 'dinosaur' &&
                        specimen.heightIsDocumented &&
                        specimen.heightMeters !== null && (
                          <> · {trimMeters(specimen.heightMeters)} m</>
                        )}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <footer className={styles.stageFooter}>
        <span className={styles.humanNote}>{showHuman ? t.compare.humanHeightNote : ''}</span>
        <span className={styles.scrollHint} aria-hidden="true">
          ← →
        </span>
      </footer>
    </section>
  );
};

/** Trims a metre value: whole numbers lose their decimal, others keep one. */
function trimMeters(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/** Ruler tick label, e.g. `12M`. */
function formatTick(value: number): string {
  return `${trimMeters(value)}M`;
}
