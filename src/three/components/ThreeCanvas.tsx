import { Suspense, type ReactNode, type CSSProperties, type FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScenePlaceholder } from './ScenePlaceholder';

export interface ThreeCanvasProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  fallback?: ReactNode;
}

export const ThreeCanvas: FC<ThreeCanvasProps> = ({
  children,
  className,
  style,
  cameraPosition = [0, 0, 5],
  cameraFov = 45,
  fallback = <ScenePlaceholder />,
}) => {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '300px',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={fallback}>{children}</Suspense>
      </Canvas>
    </div>
  );
};
