import { useEffect, useRef, type FC } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { calculateCameraFraming, type CameraFramingConfig } from '../utils';

export interface CameraRigProps {
  framing: CameraFramingConfig;
  resetTrigger: number;
  normalizedSize: [number, number, number];
}

export const CameraRig: FC<CameraRigProps> = ({ framing, resetTrigger, normalizedSize }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, size, invalidate } = useThree();

  useEffect(() => {
    const aspect = size.height > 0 ? size.width / size.height : 1.45;
    const adaptedFraming = calculateCameraFraming(normalizedSize, 40, aspect);

    camera.position.set(
      adaptedFraming.position[0],
      adaptedFraming.position[1],
      adaptedFraming.position[2]
    );
    camera.lookAt(adaptedFraming.target[0], adaptedFraming.target[1], adaptedFraming.target[2]);
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.set(
        adaptedFraming.target[0],
        adaptedFraming.target[1],
        adaptedFraming.target[2]
      );
      controlsRef.current.update();
    }

    invalidate();
  }, [camera, normalizedSize, resetTrigger, size.width, size.height, invalidate]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={framing.target}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      enableDamping={true}
      dampingFactor={0.07}
      rotateSpeed={0.75}
      zoomSpeed={0.85}
      minDistance={framing.minDistance}
      maxDistance={framing.maxDistance}
      minPolarAngle={0.18}
      maxPolarAngle={Math.PI / 2 - 0.04}
    />
  );
};
