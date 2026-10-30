import { useMemo, useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui';
import { Reveal } from '@/components/common';
import { geologicalPeriods } from '@/data/periods';
import {
  PeriodBand,
  SpeciesRanges,
  TimeInspector,
  TimelineControls,
  TimelinePlot,
  calculateTimelineGeometry,
  formatMyaValue,
  getPeriodFocusMya,
  timelineHref,
  toSpeciesEntries,
  useGeologicalTimeline,
} from '@/features/timeline';
import { useDocumentTitle } from '@/hooks';
import { formatLocalizedPeriod, interpolate, useTranslation } from '@/i18n';
import styles from './TimelinePage.module.css';

/**
 * Interactive geological timeline.
 *
 * Everything on this page derives from the canonical period records and the
 * canonical `livedFromMya` / `livedToMya` fields — no geological date is typed
 * into a component. The cursor position lives in the URL, so a moment in deep
 * time is shareable, survives refresh, and works with Back/Forward.
 *
 * The axis runs oldest → youngest left to right (252 → 66 MYA). That inversion
 * lives in one helper (`myaToTimelinePercent`) and its exact inverse, so the
 * direction can only be wrong in one place.
 */
export const TimelinePage: FC = () => {
  const { t, language } = useTranslation();
  useDocumentTitle(t.timeline.documentTitle);

  const {
    state,
    hadInvalidTime,
    wasClamped,
    activePeriod,
    visibleSpecies,
    activeSpecies,
    setTime,
    stepTime,
    setPeriod,
    reset,
  } = useGeologicalTimeline();

  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const activeIds = useMemo(
    () => new Set(activeSpecies.map((dinosaur) => dinosaur.id)),
    [activeSpecies]
  );

  const segments = useMemo(
    () => toSpeciesEntries(visibleSpecies, state.mya),
    [visibleSpecies, state.mya]
  );

  // The container width is only used for the tick density; bars are percentage
  // based, so a narrow viewport never distorts the geology.
  const geometry = useMemo(() => calculateTimelineGeometry(1200), []);

  const periodLabel = activePeriod
    ? formatLocalizedPeriod(activePeriod.id, undefined, language) || activePeriod.name
    : '';

  const ariaValueText = interpolate(t.timeline.cursorValueText, {
    value: formatMyaValue(state.mya),
    period: periodLabel,
  });

  return (
    <div className={styles.page}>
      <Container>
        <Reveal as="header" className={styles.header}>
          <span className={styles.eyebrow}>{t.timeline.eyebrow}</span>
          <h1 className={styles.title}>{t.timeline.title}</h1>
          <p className={styles.subtitle}>{t.timeline.subtitle}</p>
        </Reveal>

        <TimelineControls
          activePeriod={state.period}
          onSelectPeriod={setPeriod}
          onReset={reset}
          hadInvalidTime={hadInvalidTime}
          wasClamped={wasClamped}
        />

        <div className={styles.layout}>
          <section className={styles.stage} aria-label={t.timeline.title}>
            <div className={styles.scrollViewport}>
              <div className={styles.scrollTrack}>
                <PeriodBand activePeriodId={activePeriod?.id ?? null} onJumpToPeriod={setTime} />

                <TimelinePlot
                  ticks={geometry.ticks}
                  selectedMya={state.mya}
                  periodName={periodLabel}
                  ariaLabel={t.timeline.cursorAriaLabel}
                  ariaValueText={ariaValueText}
                  onScrub={setTime}
                  onStep={stepTime}
                />

                <SpeciesRanges
                  species={segments.map((segment) => segment.dinosaur)}
                  activeIds={activeIds}
                  highlightedId={highlightedId}
                  selectedMya={state.mya}
                  onHighlight={setHighlightedId}
                />
              </div>
            </div>

            <p className={styles.disclaimer}>{t.timeline.boundaryNote}</p>
          </section>

          <TimeInspector
            selectedMya={state.mya}
            periodId={activePeriod?.id ?? null}
            periodName={periodLabel}
            activeSpecies={activeSpecies}
          />
        </div>

        {/* Era index: museum navigation anchors, not a second timeline model. */}
        <section className={styles.eraSection} aria-label={t.timeline.eraWord}>
          <h2 className={styles.eraHeading}>{t.timeline.eraWord}</h2>
          <div className={styles.eraGrid}>
            {geologicalPeriods.map((period, index) => {
              const name = t.periods[period.id]?.name ?? period.name;
              const focusMya =
                getPeriodFocusMya(period.id) ?? Math.round((period.startMya + period.endMya) / 2);
              return (
                <Link
                  key={period.id}
                  to={timelineHref({ mya: focusMya, period: period.id })}
                  className={styles.eraCard}
                  onClick={(event) => {
                    // Keep it client-side: update the cursor without a reload.
                    event.preventDefault();
                    setPeriod(period.id);
                  }}
                >
                  <span className={styles.eraIndex}>0{index + 1}</span>
                  <span className={styles.eraName}>{name}</span>
                  <span className={styles.eraRange}>
                    {period.startMya}–{period.endMya} {t.timeline.myaUnit}
                  </span>
                  <span className={styles.eraDescription}>
                    {t.periods[period.id]?.description ?? period.description}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </Container>
    </div>
  );
};

export default TimelinePage;
