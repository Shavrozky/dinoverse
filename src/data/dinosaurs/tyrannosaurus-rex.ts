import type { Dinosaur } from '@/types';

export const tyrannosaurusRex: Dinosaur = {
  id: 'dino-tyrannosaurus-rex',
  slug: 'tyrannosaurus-rex',
  name: 'Tyrannosaurus rex',
  scientificName: 'Tyrannosaurus rex',
  aliases: ['trex', 't-rex', 't rex', 'tyrant lizard king'],
  meaning: 'Tyrant Lizard King',
  period: 'cretaceous',
  periodStage: 'Late',
  livedFromMya: 68,
  livedToMya: 66,
  diet: 'carnivore',
  clade: 'Tyrannosauridae',
  lengthMeters: 12.3,
  heightMeters: 3.7,
  weightKg: 8400,
  locations: ['North America'],
  formations: ['Hell Creek Formation', 'Lance Formation'],
  discoveredYear: 1902,
  namedBy: 'Henry Fairfield Osborn (1905)',
  shortDescription:
    'An apex Late Cretaceous theropod renowned for its massive skull, binocular vision, and bone-crushing bite.',
  description:
    'Tyrannosaurus rex was one of the largest known land carnivores of all time, inhabiting western North America during the final Maastrichtian age of the Late Cretaceous. Equipped with a heavily reinforced skull, serrated conical teeth, and acute stereoscopic vision and olfaction, it acted as both an apex predator and opportunistic scavenger across floodplains and subtropical forests.',
  modelPath: '/models/dinosaurs/tyrannosaurus-rex/model.glb',
  image: '/images/dinosaurs/tyrannosaurus-rex/tyranosaurus.jpg',
  thumbnailPath: '/images/dinosaurs/tyrannosaurus-rex/thumbnail.jpg',
  featured: true,
};
