import { useRef, type FC } from 'react';
import { useFrame } from '@react-three/fiber';
import type { DirectionalLight } from 'three';

export interface HeroMuseumLightingProps {
  reducedMotion?: boolean;
}

/**
 * Editorial museum lighting designed specifically for the Homepage Hero exhibition.
 * Features an overhead warm ivory key light, dramatic aged brass rim light carving
 * the specimen's silhouette, a soft cool slate fill light, and restrained ambient darkness.
 */
export const HeroMuseumLighting: FC<HeroMuseumLightingProps> = ({ reducedMotion = false }) => {
  const keyLightRef = useRef<DirectionalLight>(null);
  const rimLightRef = useRef<DirectionalLight>(null);
  const fillLightRef = useRef<DirectionalLight>(null);
  const revealProgress = useRef(reducedMotion ? 1 : 0);

  // Soft lighting reveal on mount (emerging gracefully from the dark exhibition void)
  useFrame((_, delta) => {
    if (revealProgress.current < 1) {
      revealProgress.current = Math.min(1, revealProgress.current + delta / 1.15);
      // Smooth quadratic ease-out
      const factor = 1 - Math.pow(1 - revealProgress.current, 2);

      if (keyLightRef.current) keyLightRef.current.intensity = 2.2 * factor;
      if (rimLightRef.current) rimLightRef.current.intensity = 3.6 * factor;
      if (fillLightRef.current) fillLightRef.current.intensity = 0.65 * factor;
    }
  });

  return (
    <>
      {/* Deep museum exhibition ambient - keeps shadows dark carbon black */}
      <ambientLight intensity={0.16} color="#1c1916" />

      {/* Warm Ivory Key Light from high oblique front-right */}
      <directionalLight
        ref={keyLightRef}
        position={[3.2, 4.2, 3.6]}
        intensity={reducedMotion ? 2.2 : 0}
        color="#fbf4ea"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Strong Aged Brass Rim Light from behind to define the silhouette */}
      <directionalLight
        ref={rimLightRef}
        position={[2.4, 3.0, -4.0]}
        intensity={reducedMotion ? 3.6 : 0}
        color="#d4af37"
      />

      {/* Cool Slate Fill Light from opposite front-left */}
      <directionalLight
        ref={fillLightRef}
        position={[-3.6, 1.4, 2.6]}
        intensity={reducedMotion ? 0.65 : 0}
        color="#7d92a4"
      />
    </>
  );
};
