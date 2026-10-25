import { useMemo } from 'react';
import { getAdjacentDinosaurs, getDinosaurBySlug, getRelatedDinosaurs } from '@/data/dinosaurs';
import type { Dinosaur } from '@/types';

export interface UseDinosaurReturn {
  dinosaur: Dinosaur | undefined;
  relatedDinosaurs: Dinosaur[];
  previousDinosaur: Dinosaur | undefined;
  nextDinosaur: Dinosaur | undefined;
  isLoading: boolean;
}

export function useDinosaur(slug: string | undefined): UseDinosaurReturn {
  const dinosaur = useMemo(() => {
    if (!slug) return undefined;
    return getDinosaurBySlug(slug);
  }, [slug]);

  const relatedDinosaurs = useMemo(() => {
    if (!dinosaur) return [];
    return getRelatedDinosaurs(dinosaur, 3);
  }, [dinosaur]);

  const { previous, next } = useMemo(() => {
    if (!dinosaur) return { previous: undefined, next: undefined };
    return getAdjacentDinosaurs(dinosaur.slug);
  }, [dinosaur]);

  return {
    dinosaur,
    relatedDinosaurs,
    previousDinosaur: previous,
    nextDinosaur: next,
    isLoading: false,
  };
}
