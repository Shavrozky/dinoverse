/**
 * Feature: Interactive Geological Timeline
 *
 * State lives in the URL (`?time=&period=`); the collection is projected onto a
 * single 252 → 66 MYA axis where MYA decreases to the right. Range bars use true
 * geological coordinates — never normalised widths. DOM/CSS only: no canvas, no
 * chart library, no virtualization.
 */
export * from './types/timeline';
export * from './utils/geologicalScale';
export * from './utils/timelineUrl';
export * from './utils/timelineLabels';
export * from './hooks/useGeologicalTimeline';
export * from './components/index';
