import type { AppLanguage } from '@/store/useAppSettings';

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
 * Formats a mass in kilograms into kg or tonnes/ton (e.g., 8500 -> "8.5 tonnes" or "8.5 ton").
 */
export function formatWeight(kilograms: number, language: AppLanguage = 'en'): string {
  if (kilograms >= 1000) {
    const tonnes = kilograms / 1000;
    const formatted = Number.isInteger(tonnes) ? tonnes.toString() : tonnes.toFixed(1);
    if (language === 'id') {
      return `${formatted} ton`;
    }
    return `${formatted} ${tonnes === 1 ? 'tonne' : 'tonnes'}`;
  }
  const locale = language === 'id' ? 'id-ID' : 'en-US';
  return `${kilograms.toLocaleString(locale)} kg`;
}

/**
 * Formats a geological time interval in millions of years ago
 * (e.g., "68–66 million years ago" or "68–66 juta tahun lalu").
 */
export function formatMillionsOfYears(
  fromMya: number,
  toMya?: number,
  language: AppLanguage = 'en'
): string {
  const unit = language === 'id' ? 'juta tahun lalu' : 'million years ago';
  if (toMya === undefined || fromMya === toMya) {
    return `${fromMya} ${unit}`;
  }
  return `${fromMya}–${toMya} ${unit}`;
}

/**
 * Formats result counts with proper localized noun agreement.
 */
export function formatResultCount(count: number, language: AppLanguage = 'en'): string {
  if (language === 'id') {
    return `${count} dinosaurus`;
  }
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
