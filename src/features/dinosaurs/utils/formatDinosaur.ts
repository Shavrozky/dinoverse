/**
 * Formats a length in meters for display (e.g., 12.3 -> "12.3 m", 9 -> "9 m").
 */
export function formatLength(meters: number): string {
  const formatted = Number.isInteger(meters) ? meters.toString() : meters.toFixed(1);
  return `${formatted} m`;
}

/**
 * Legacy alias for formatLength.
 */
export function formatMeters(meters: number): string {
  return formatLength(meters);
}

/**
 * Formats a mass in kilograms into kg or tonnes (e.g., 8500 -> "8.5 tonnes", 75 -> "75 kg").
 */
export function formatWeight(kilograms: number): string {
  if (kilograms >= 1000) {
    const tonnes = kilograms / 1000;
    const formatted = Number.isInteger(tonnes) ? tonnes.toString() : tonnes.toFixed(1);
    return `${formatted} ${tonnes === 1 ? 'tonne' : 'tonnes'}`;
  }
  return `${kilograms.toLocaleString('en-US')} kg`;
}

/**
 * Formats a geological time interval in millions of years ago (e.g., "68–66 million years ago").
 */
export function formatMillionsOfYears(fromMya: number, toMya?: number): string {
  if (toMya === undefined || fromMya === toMya) {
    return `${fromMya} million years ago`;
  }
  return `${fromMya}–${toMya} million years ago`;
}

/**
 * Formats result counts with proper singular/plural noun agreement.
 */
export function formatResultCount(count: number): string {
  return `${count} ${count === 1 ? 'dinosaur' : 'dinosaurs'}`;
}

/**
 * Generates concise monogram initials for specimen placeholder cards.
 */
export function getDinosaurInitials(scientificName: string): string {
  const parts = scientificName.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0].toUpperCase()}.${parts[1][0].toLowerCase()}.`;
  }
  return scientificName.slice(0, 2).toUpperCase();
}
