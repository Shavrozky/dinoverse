import type { Dinosaur } from '@/types';

/**
 * Normalizes a search query string by lowercasing, trimming, and collapsing repeated whitespace.
 */
export function normalizeSearchTerm(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

function toCompactToken(value: string): string {
  return normalizeSearchTerm(value).replace(/[-.\s]/g, '');
}

/**
 * Checks whether a single dinosaur record matches the provided search query.
 */
export function matchesDinosaurSearch(dinosaur: Dinosaur, query: string): boolean {
  const normalizedQuery = normalizeSearchTerm(query);
  if (!normalizedQuery) {
    return true;
  }

  const compactQuery = toCompactToken(normalizedQuery);

  const searchableFields: string[] = [
    dinosaur.name,
    dinosaur.scientificName,
    dinosaur.clade,
    dinosaur.meaning ?? '',
    ...dinosaur.locations,
    ...(dinosaur.aliases ?? []),
  ];

  return searchableFields.some((field) => {
    const normalizedField = normalizeSearchTerm(field);
    if (normalizedField.includes(normalizedQuery)) {
      return true;
    }
    if (compactQuery.length >= 2 && toCompactToken(field).includes(compactQuery)) {
      return true;
    }
    return false;
  });
}

/**
 * Filters a list of dinosaurs by a search term without mutating the input array.
 */
export function searchDinosaurs(dinosaurs: readonly Dinosaur[], query: string): Dinosaur[] {
  const normalizedQuery = normalizeSearchTerm(query);
  if (!normalizedQuery) {
    return [...dinosaurs];
  }

  return dinosaurs.filter((dinosaur) => matchesDinosaurSearch(dinosaur, normalizedQuery));
}
