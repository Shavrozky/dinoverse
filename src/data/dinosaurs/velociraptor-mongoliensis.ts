import type { Dinosaur } from '@/types';

export const velociraptorMongoliensis: Dinosaur = {
  id: 'dino-velociraptor-mongoliensis',
  slug: 'velociraptor-mongoliensis',
  name: 'Velociraptor',
  scientificName: 'Velociraptor mongoliensis',
  aliases: ['raptor', 'velociraptor mongoliensis'],
  meaning: 'Swift Seizer',
  period: 'cretaceous',
  periodStage: 'Late',
  livedFromMya: 75,
  livedToMya: 71,
  diet: 'carnivore',
  clade: 'Dromaeosauridae',
  lengthMeters: 2.0,
  heightMeters: 0.5,
  weightKg: 15,
  locations: ['Asia'],
  formations: ['Djadochta Formation'],
  discoveredYear: 1923,
  namedBy: 'Henry Fairfield Osborn (1924)',
  shortDescription:
    'A feathered, turkey-sized dromaeosaurid theropod armed with an enlarged sickle-shaped claw on each hindfoot.',
  description:
    'Velociraptor mongoliensis was a nimble, feathered dromaeosaurid that lived in the arid dune environments of Late Cretaceous Mongolia. Much smaller than its popular cinema depictions, it measured roughly two meters long including its stiffened tail. Quill knobs preserved on its forearm bones confirm the presence of pennaceous feathers, while famous fossils—such as the "Fighting Dinosaurs" specimen interlocked with Protoceratops—preserve direct evidence of its predatory behavior.',
  modelPath: '/models/dinosaurs/velociraptor/model.glb',
};
