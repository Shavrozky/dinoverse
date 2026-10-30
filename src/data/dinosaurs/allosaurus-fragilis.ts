import type { Dinosaur } from '@/types';

export const allosaurusFragilis: Dinosaur = {
  id: 'dino-allosaurus-fragilis',
  slug: 'allosaurus-fragilis',
  name: 'Allosaurus',
  scientificName: 'Allosaurus fragilis',
  aliases: ['different lizard', 'allosaurus fragilis'],
  meaning: 'Different Lizard',
  period: 'jurassic',
  periodStage: 'Late',
  livedFromMya: 155,
  livedToMya: 145,
  diet: 'carnivore',
  clade: 'Allosauridae',
  lengthMeters: 8.5,
  heightMeters: 3.2,
  weightKg: 2000,
  locations: ['North America', 'Europe'],
  formations: ['Morrison Formation', 'Lourinhã Formation'],
  discoveredYear: 1877,
  namedBy: 'Othniel Charles Marsh (1877)',
  shortDescription:
    'The dominant large predatory theropod of the Late Jurassic Morrison ecosystem, equipped with brow horns and grasping three-fingered forelimbs.',
  description:
    'Allosaurus fragilis stood at the top of the Late Jurassic food web in North America. Armed with laterally compressed, blade-like serrated teeth and powerful three-clawed forelimbs, it preyed upon ornithopods, stegosaurs, and juvenile sauropods. A pair of prominent lacrimal crests sat just ahead of and above its eyes.',
  modelPath: '/models/dinosaurs/allosaurus/model.glb',
  image: '/images/dinosaurs/tyrannosaurus-rex/tyranosaurus.jpg',
  thumbnailPath: '/images/dinosaurs/allosaurus/thumbnail.jpg',
};
