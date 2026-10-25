import { OrbitControls } from '@react-three/drei';
import { ThreeCanvas } from '../ThreeCanvas';
import styles from './DinosaurViewer.module.css';

export interface DinosaurViewerProps {
  name: string;
  modelPath?: string;
}

export function DinosaurViewer({ name, modelPath }: DinosaurViewerProps) {
  return (
    <div className={styles.viewer} aria-label={`Interactive 3D viewer for ${name}`}>
      <ThreeCanvas style={{ width: '100%', height: '100%', minHeight: '100%' }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 4]} intensity={2} />

        <mesh>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial roughness={0.55} metalness={0.05} />
        </mesh>

        <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08} />
      </ThreeCanvas>

      {modelPath && <div className={styles.debugLabel}>{modelPath}</div>}
    </div>
  );
}
