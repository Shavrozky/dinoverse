import type { Dinosaur } from '@/types';
import type { DinosaurSortOption } from '../types';

/**
 * Returns a new sorted array of dinosaurs without mutating the source array.
 */
export function sortDinosaurs(
  dinosaurs: readonly Dinosaur[],
  sortOption: DinosaurSortOption = 'name-asc'
): Dinosaur[] {
  return [...dinosaurs].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'largest':
        if (b.lengthMeters !== a.lengthMeters) {
          return b.lengthMeters - a.lengthMeters;
        }
        return a.name.localeCompare(b.name);
      case 'smallest':
        if (a.lengthMeters !== b.lengthMeters) {
          return a.lengthMeters - b.lengthMeters;
        }
        return a.name.localeCompare(b.name);
      case 'oldest':
        if (b.livedFromMya !== a.livedFromMya) {
          return b.livedFromMya - a.livedFromMya;
        }
        return a.name.localeCompare(b.name);
      case 'youngest':
        if (a.livedToMya !== b.livedToMya) {
          return a.livedToMya - b.livedToMya;
        }
        return a.name.localeCompare(b.name);
      default:
        return a.name.localeCompare(b.name);
    }
  });
}
