import type { Dinosaur } from '@/types';

/** `68–66 MYA`, compact museum form. */
export function speciesRangeLabel(dinosaur: Dinosaur, myaUnit: string): string {
  return `${dinosaur.livedFromMya}–${dinosaur.livedToMya} ${myaUnit}`;
}

/**
 * Rounds a million-years value for display.
 *
 * Ranges in the collection carry one decimal at most (e.g. 75.5). Displaying
 * more would imply precision the underlying estimates do not have.
 */
export function formatMyaValue(mya: number): string {
  const rounded = Math.round(mya * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
