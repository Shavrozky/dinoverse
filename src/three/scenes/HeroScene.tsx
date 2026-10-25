import { useRef, type FC } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import type { Mesh } from 'three';
import { DefaultLighting } from '@/three/lighting';

export const HeroScene: FC = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <>
      <DefaultLighting />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.4, 1]} />
          <meshStandardMaterial
            color="#c8c0ae"
            roughness={0.4}
            metalness={0.15}
            wireframe={false}
          />
        </mesh>
      </Float>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
    </>
  );
};
