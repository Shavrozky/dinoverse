import type { FC } from 'react';

export const DefaultLighting: FC = () => {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <directionalLight position={[-10, -5, -5]} intensity={0.4} color="#d0a35d" />
    </>
  );
};
