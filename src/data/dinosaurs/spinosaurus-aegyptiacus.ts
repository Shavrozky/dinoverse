import type { Dinosaur } from '@/types';

export const spinosaurusAegyptiacus: Dinosaur = {
  id: 'dino-spinosaurus-aegyptiacus',
  slug: 'spinosaurus-aegyptiacus',
  name: 'Spinosaurus',
  scientificName: 'Spinosaurus aegyptiacus',
  aliases: ['spino', 'spine lizard', 'spinosaurus aegyptiacus'],
  meaning: 'Spine Lizard',
  period: 'cretaceous',
  periodStage: 'Late',
  livedFromMya: 99,
  livedToMya: 93.5,
  diet: 'piscivore',
  clade: 'Spinosauridae',
  lengthMeters: 14.0,
  heightMeters: 4.5,
  weightKg: 7400,
  locations: ['North Africa'],
  formations: ['Bahariya Formation', 'Kem Kem Beds'],
  discoveredYear: 1912,
  namedBy: 'Ernst Stromer (1915)',
  shortDescription:
    'A semiaquatic giant theropod distinguished by a tall neural spine sail, crocodile-like snout, and paddle-like tail.',
  description:
    'Spinosaurus aegyptiacus inhabited the expansive river deltas and mangrove swamps of Cretaceous North Africa. Uniquely adapted for a semiaquatic lifestyle among giant theropods, it featured elongated jaws filled with conical, non-serrated teeth for seizing slippery aquatic prey, high-placed nostrils, dense limb bones for buoyancy control, and tall dorsal neural spines forming a prominent sail along its back.',
  featured: true,
  image: '/images/dinosaurs/spinosaurus-aegyptiacus/spinosaurus.jpg',
  thumbnailPath: '/images/dinosaurs/spinosaurus-aegyptiacus/thumbnail.jpg',
};
