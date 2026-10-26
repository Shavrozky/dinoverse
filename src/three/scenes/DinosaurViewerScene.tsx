import { useCallback, useMemo, useState, type FC } from 'react';
import type { GraphicsQuality } from '@/store/useAppSettings';
import { CameraRig } from '../camera';
import { DinosaurModel, type DinosaurModelReadyPayload } from '../components/DinosaurModel';
import { DinosaurMuseumLighting } from '../lighting';
import { calculateCameraFraming, type SpecimenAnimationAction } from '../utils';

export interface DinosaurViewerSceneProps {
  modelPath: string;
  activeClipName: string | null;
  resetTrigger: number;
  quality?: GraphicsQuality;
  reducedMotion?: boolean;
  onAnimationsAvailable?: (actions: SpecimenAnimationAction[]) => void;
}

const DEFAULT_NORMALIZED_SIZE: [number, number, number] = [0.6, 1.35, 3.8];

export const DinosaurViewerScene: FC<DinosaurViewerSceneProps> = ({
  modelPath,
  activeClipName,
  resetTrigger,
  quality = 'high',
  reducedMotion = false,
  onAnimationsAvailable,
}) => {
  const [normalizedSize, setNormalizedSize] =
    useState<[number, number, number]>(DEFAULT_NORMALIZED_SIZE);

  const framing = useMemo(() => calculateCameraFraming(normalizedSize, 40, 1.45), [normalizedSize]);

  const handleModelReady = useCallback(
    (payload: DinosaurModelReadyPayload) => {
      setNormalizedSize(payload.transform.normalizedSize);
      onAnimationsAvailable?.(payload.actions);
    },
    [onAnimationsAvailable]
  );

  return (
    <>
      <DinosaurMuseumLighting quality={quality} />

      <DinosaurModel
        src={modelPath}
        activeClipName={activeClipName}
        reducedMotion={reducedMotion}
        onModelReady={handleModelReady}
      />

      {/* Museum Exhibition Plinth & Shadow Ground */}
      <group position={[0, -0.002, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[3.2, 48]} />
          <meshStandardMaterial color="#0c0e0c" roughness={0.92} metalness={0.05} />
        </mesh>

        {/* Subtle archival measurement ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
          <ringGeometry args={[2.35, 2.37, 64]} />
          <meshBasicMaterial color="#d0a35d" transparent opacity={0.18} />
        </mesh>
      </group>

      <CameraRig framing={framing} resetTrigger={resetTrigger} normalizedSize={normalizedSize} />
    </>
  );
};
