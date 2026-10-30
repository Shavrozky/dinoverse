import type { Dinosaur } from '@/types';

export function isDinosaurAliveAt(dinosaur: Dinosaur, mya: number): boolean {
  return mya <= dinosaur.livedFromMya && mya >= dinosaur.livedToMya;
}

export function getDinosaursAliveAt(dinosaurs: Dinosaur[], mya: number): Dinosaur[] {
  return dinosaurs.filter((dinosaur) => isDinosaurAliveAt(dinosaur, mya));
}
