import { useRef, type FC } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

export interface ScenePlaceholderProps {
  color?: string;
}

export const ScenePlaceholder: FC<ScenePlaceholderProps> = ({ color = '#d0a35d' }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
};
