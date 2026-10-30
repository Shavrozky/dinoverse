export type MesozoicPeriod = 'triassic' | 'jurassic' | 'cretaceous';

export function getPeriodAtMya(mya: number): MesozoicPeriod | null {
  if (mya <= 252 && mya > 201) {
    return 'triassic';
  }

  if (mya <= 201 && mya > 145) {
    return 'jurassic';
  }

  if (mya <= 145 && mya >= 66) {
    return 'cretaceous';
  }

  return null;
}
