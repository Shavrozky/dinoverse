import type { Dinosaur } from '@/types';

export const triceratopsHorridus: Dinosaur = {
  id: 'dino-triceratops-horridus',
  slug: 'triceratops-horridus',
  name: 'Triceratops',
  scientificName: 'Triceratops horridus',
  aliases: ['three horned face', 'triceratops horridus'],
  meaning: 'Three-Horned Face',
  period: 'cretaceous',
  periodStage: 'Late',
  livedFromMya: 68,
  livedToMya: 66,
  diet: 'herbivore',
  clade: 'Ceratopsidae',
  lengthMeters: 9.0,
  heightMeters: 3.0,
  weightKg: 9000,
  locations: ['North America'],
  formations: ['Hell Creek Formation', 'Lance Formation', 'Evanston Formation'],
  discoveredYear: 1887,
  namedBy: 'Othniel Charles Marsh (1889)',
  shortDescription:
    'A heavily built quadrupedal ceratopsian bearing three facial horns and a solid bony neck frill.',
  description:
    'Triceratops horridus was among the last non-avian dinosaurs to evolve prior to the Cretaceous–Paleogene extinction event. Sharing its North American floodplain habitat with Tyrannosaurus rex, it possessed a parrot-like beak adapted for shearing tough fibrous vegetation, rows of self-sharpening dental batteries, and an imposing cranial display of two brow horns, a nasal horn, and a solid bone frill.',
  modelPath: '/models/dinosaurs/triceratops/model.glb',
  image: '/images/dinosaurs/triceratops-horridus/triceratops.jpg',
  thumbnailPath: '/images/dinosaurs/triceratops-horridus/thumbnail.jpg',
  featured: true,
};
