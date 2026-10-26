import type { FC, MutableRefObject } from 'react';
import type { AppTheme } from '@/store/useAppSettings';
import type { NormalizedPointer } from '@/hooks';
import { HeroMuseumLighting } from '@/three/lighting';
import { HeroDinosaur } from '@/three/components/HeroDinosaur';

export interface HeroSceneProps {
  reducedMotion?: boolean;
  theme?: AppTheme;
  /** Shared normalized pointer, supplied by the hero's single listener. */
  pointer?: MutableRefObject<NormalizedPointer>;
}

/**
 * Homepage Cinematic Exhibition Hero Scene.
 *
 * An art-directed Velociraptor digital specimen lit by theme-aware museum
 * spotlights. Both the lighting and the model animate from the same timing
 * contract so the exhibit reads as one event: the lights come up, the
 * specimen settles onto its plinth.
 */
export const HeroScene: FC<HeroSceneProps> = ({
  reducedMotion = false,
  theme = 'dark',
  pointer,
}) => {
  return (
    <>
      <HeroMuseumLighting reducedMotion={reducedMotion} theme={theme} pointer={pointer} />
      <HeroDinosaur reducedMotion={reducedMotion} pointer={pointer} />
    </>
  );
};
