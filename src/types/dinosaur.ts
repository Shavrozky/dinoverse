export const DINOSAUR_DIETS = ['carnivore', 'herbivore', 'omnivore', 'piscivore'] as const;
export type DinosaurDiet = (typeof DINOSAUR_DIETS)[number];

export const GEOLOGICAL_PERIODS = ['triassic', 'jurassic', 'cretaceous'] as const;
export type GeologicalPeriod = (typeof GEOLOGICAL_PERIODS)[number];

export interface Dinosaur {
  id: string;
  slug: string;

  name: string;
  scientificName: string;
  aliases?: string[];

  meaning?: string;

  period: GeologicalPeriod;
  periodStage?: string;

  livedFromMya: number;
  livedToMya: number;

  diet: DinosaurDiet;
  clade: string;

  lengthMeters: number;
  heightMeters?: number;
  weightKg?: number;

  locations: string[];
  formations?: string[];

  discoveredYear?: number;
  namedBy?: string;

  description: string;
  shortDescription: string;

  image?: string;
  thumbnailPath: string;
  modelPath?: string;

  featured?: boolean;
}
