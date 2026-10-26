import { Suspense, type ReactNode, type CSSProperties, type FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScenePlaceholder } from './ScenePlaceholder';

export interface ThreeCanvasProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  shadows?: boolean;
  dpr?: number | [number, number];
  fallback?: ReactNode;
}

export const ThreeCanvas: FC<ThreeCanvasProps> = ({
  children,
  className,
  style,
  cameraPosition = [0, 0, 5],
  cameraFov = 40,
  shadows = true,
  dpr = [1, 2],
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
        shadows={shadows}
        camera={{ position: cameraPosition, fov: cameraFov, near: 0.1, far: 100 }}
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={fallback}>{children}</Suspense>
      </Canvas>
    </div>
  );
};
