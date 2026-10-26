import { useMemo, useRef, type FC } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MathUtils, type Group, type Mesh, type Object3D } from 'three';
import { SkeletonUtils } from 'three-stdlib';

export interface HeroDinosaurProps {
  src?: string;
  reducedMotion?: boolean;
}

const DEFAULT_HERO_MODEL_PATH = '/models/dinosaurs/velociraptor/model.glb';

// Preload the hero asset for immediate readiness
useGLTF.preload(DEFAULT_HERO_MODEL_PATH);

function isMeshObject(node: Object3D): node is Mesh {
  return (node as Mesh).isMesh === true;
}

/**
 * Art-directed 3D dinosaur specimen for the homepage exhibition hero.
 *
 * Responsibilities:
 * - Loads the Velociraptor GLB asset asynchronously
 * - Safely clones scene hierarchy and configures mesh shadow casting/receiving
 * - Sets the model's natural center-of-mass pivot around the torso/hips
 * - Art-directs the 3/4 predatory stance facing towards the headline
 * - Implements subtle, heavy pointer parallax with interpolation
 * - Provides responsive composition adjustments between desktop and mobile viewports
 */
export const HeroDinosaur: FC<HeroDinosaurProps> = ({
  src = DEFAULT_HERO_MODEL_PATH,
  reducedMotion = false,
}) => {
  const outerGroupRef = useRef<Group>(null);
  const { size } = useThree();
  const gltf = useGLTF(src);

  // Safely clone and configure mesh shadows and materials
  const clonedScene = useMemo(() => {
    const cloned = SkeletonUtils.clone(gltf.scene);

    cloned.traverse((node) => {
      if (isMeshObject(node)) {
        // Cornea material is transparent transmission glass; disable shadow casting
        if (node.name.toLowerCase().includes('cornea')) {
          node.castShadow = false;
          node.receiveShadow = false;
        } else {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      }
    });

    return cloned;
  }, [gltf.scene]);

  // Responsive art direction targets
  const isMobile = size.width < 960;

  // Base transforms:
  // Desktop: Positioned on the right (x = 1.28) facing the headline (-46 deg yaw),
  // with snout prominent and tail cropped into darkness on the right edge.
  // Mobile: Centered (x = 0.08) in the dedicated exhibition viewport with a cinematic closeup.
  const basePosition: [number, number, number] = isMobile ? [0.08, -0.28, 0] : [1.28, -0.2, 0];
  const baseRotation: [number, number, number] = isMobile ? [-0.03, -0.44, 0] : [-0.04, -0.8, 0.02];
  const baseScale = isMobile ? 1.22 : 1.52;

  // Damped pointer parallax
  useFrame((state, delta) => {
    const group = outerGroupRef.current;
    if (!group) return;

    if (reducedMotion) {
      group.rotation.x = baseRotation[0];
      group.rotation.y = baseRotation[1];
      group.rotation.z = baseRotation[2];
      return;
    }

    // Pointer values are normalized [-1, 1]
    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;

    // Subtle parallax bounds: yaw ±4 deg, pitch ±2 deg
    const targetRotY = baseRotation[1] + pointerX * 0.07;
    const targetRotX = baseRotation[0] - pointerY * 0.035;

    // Smooth inertia lerping for a massive, cinematic feel
    const lerpSpeed = delta * 2.8;
    group.rotation.y = MathUtils.lerp(group.rotation.y, targetRotY, lerpSpeed);
    group.rotation.x = MathUtils.lerp(group.rotation.x, targetRotX, lerpSpeed);
  });

  return (
    <group
      ref={outerGroupRef}
      position={basePosition}
      rotation={baseRotation}
      scale={baseScale}
      dispose={null}
    >
      {/*
        Inner group applies an anatomical pivot offset to align the hips/torso
        at local (0, 0, 0), ensuring rotations pivot around the creature's core mass.
      */}
      <primitive object={clonedScene} position={[0, -0.72, 0.3]} />
    </group>
  );
};
