import type { FC } from 'react';
import type { GraphicsQuality } from '@/store/useAppSettings';

export interface DinosaurMuseumLightingProps {
  quality?: GraphicsQuality;
}

export const DinosaurMuseumLighting: FC<DinosaurMuseumLightingProps> = ({ quality = 'high' }) => {
  const castShadows = quality !== 'low';
  const shadowMapSize = quality === 'high' ? 1024 : 512;

  return (
    <>
      {/* Subtle museum ambient & ground bounce */}
      <hemisphereLight args={['#e8e2d5', '#141210', 0.55]} />

      {/* Warm museum key spotlight */}
      <directionalLight
        position={[4.5, 6.5, 4.0]}
        intensity={2.2}
        color="#f3ead8"
        castShadow={castShadows}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-3.5}
        shadow-bias={-0.0005}
      />

      {/* Cool archival shadow fill */}
      <directionalLight position={[-4.5, 2.8, 2.5]} intensity={0.65} color="#8fa0b5" />

      {/* Warm brass back rim light for silhouette separation */}
      <directionalLight position={[0, 4.2, -5.0]} intensity={1.15} color="#d0a35d" />
    </>
  );
};
