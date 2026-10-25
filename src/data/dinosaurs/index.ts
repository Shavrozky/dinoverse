import type { Dinosaur } from '@/types';
import { allosaurusFragilis } from './allosaurus-fragilis';
import { ankylosaurusMagniventris } from './ankylosaurus-magniventris';
import { argentinosaurusHuinculensis } from './argentinosaurus-huinculensis';
import { brachiosaurusAltithorax } from './brachiosaurus-altithorax';
import { carnotaurusSastrei } from './carnotaurus-sastrei';
import { coelophysisBauri } from './coelophysis-bauri';
import { deinonychusAntirrhopus } from './deinonychus-antirrhopus';
import { dilophosaurusWetherilli } from './dilophosaurus-wetherilli';
import { diplodocusCarnegii } from './diplodocus-carnegii';
import { gallimimusBullatus } from './gallimimus-bullatus';
import { giganotosaurusCarolinii } from './giganotosaurus-carolinii';
import { iguanodonBernissartensis } from './iguanodon-bernissartensis';
import { pachycephalosaurusWyomingensis } from './pachycephalosaurus-wyomingensis';
import { parasaurolophusWalkeri } from './parasaurolophus-walkeri';
import { plateosaurusTrossingensis } from './plateosaurus-trossingensis';
import { spinosaurusAegyptiacus } from './spinosaurus-aegyptiacus';
import { stegosaurusStenops } from './stegosaurus-stenops';
import { triceratopsHorridus } from './triceratops-horridus';
import { tyrannosaurusRex } from './tyrannosaurus-rex';
import { velociraptorMongoliensis } from './velociraptor-mongoliensis';

export const dinosaurs: readonly Dinosaur[] = [
  tyrannosaurusRex,
  triceratopsHorridus,
  spinosaurusAegyptiacus,
  velociraptorMongoliensis,
  brachiosaurusAltithorax,
  stegosaurusStenops,
  allosaurusFragilis,
  ankylosaurusMagniventris,
  diplodocusCarnegii,
  parasaurolophusWalkeri,
  carnotaurusSastrei,
  dilophosaurusWetherilli,
  iguanodonBernissartensis,
  pachycephalosaurusWyomingensis,
  deinonychusAntirrhopus,
  giganotosaurusCarolinii,
  argentinosaurusHuinculensis,
  coelophysisBauri,
  plateosaurusTrossingensis,
  gallimimusBullatus,
];

/**
 * Legacy alias preserved for backward compatibility.
 */
export const sampleDinosaurs: readonly Dinosaur[] = dinosaurs;

/**
 * Returns a shallow copy of all dinosaur records.
 */
export function getDinosaurs(): Dinosaur[] {
  return [...dinosaurs];
}

/**
 * Resolves a single dinosaur record by its URL slug.
 */
export function getDinosaurBySlug(slug: string): Dinosaur | undefined {
  const normalized = slug.trim().toLowerCase();
  return dinosaurs.find((dinosaur) => dinosaur.slug === normalized);
}

/**
 * Returns featured dinosaurs for homepage highlights.
 */
export function getFeaturedDinosaurs(limit = 3): Dinosaur[] {
  return dinosaurs.filter((dinosaur) => dinosaur.featured).slice(0, limit);
}

/**
 * Computes related dinosaurs ranked by shared clade, period, diet, and shared locations.
 */
export function getRelatedDinosaurs(target: Dinosaur, limit = 3): Dinosaur[] {
  return dinosaurs
    .filter((candidate) => candidate.id !== target.id && candidate.slug !== target.slug)
    .map((candidate) => {
      let score = 0;

      if (candidate.clade.toLowerCase() === target.clade.toLowerCase()) {
        score += 4;
      }
      if (candidate.period === target.period) {
        score += 3;
      }
      if (candidate.diet === target.diet) {
        score += 2;
      }

      const sharedLocation = candidate.locations.some((loc) => target.locations.includes(loc));
      if (sharedLocation) {
        score += 1;
      }

      return { dinosaur: candidate, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.dinosaur.name.localeCompare(b.dinosaur.name);
    })
    .slice(0, limit)
    .map((entry) => entry.dinosaur);
}

/**
 * Returns the previous and next dinosaurs in catalog order for specimen navigation.
 */
export function getAdjacentDinosaurs(slug: string): {
  previous: Dinosaur | undefined;
  next: Dinosaur | undefined;
} {
  const index = dinosaurs.findIndex((dinosaur) => dinosaur.slug === slug);
  if (index === -1) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: index > 0 ? dinosaurs[index - 1] : dinosaurs[dinosaurs.length - 1],
    next: index < dinosaurs.length - 1 ? dinosaurs[index + 1] : dinosaurs[0],
  };
}
