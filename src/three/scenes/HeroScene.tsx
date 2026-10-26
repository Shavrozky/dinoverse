import type { FC } from 'react';
import { HeroMuseumLighting } from '@/three/lighting';
import { HeroDinosaur } from '@/three/components/HeroDinosaur';

export interface HeroSceneProps {
  reducedMotion?: boolean;
}

/**
 * Homepage Cinematic Exhibition Hero Scene.
 *
 * Replaces the temporary geometric primitive with an art-directed Velociraptor
 * holotype specimen illuminated by museum exhibition spotlights.
 *
 * Designed with fixed cinematic perspective, no OrbitControls, subtle pointer parallax,
 * and dramatic silhouette framing against the museum void.
 */
export const HeroScene: FC<HeroSceneProps> = ({ reducedMotion = false }) => {
  return (
    <>
      <HeroMuseumLighting reducedMotion={reducedMotion} />
      <HeroDinosaur reducedMotion={reducedMotion} />
    </>
  );
};
