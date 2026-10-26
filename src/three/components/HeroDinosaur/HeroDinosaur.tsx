import { useEffect, useMemo, useRef, type FC, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MathUtils, type Group, type Mesh, type Object3D } from 'three';
import { SkeletonUtils } from 'three-stdlib';
import type { NormalizedPointer } from '@/hooks';

export interface HeroDinosaurProps {
  src?: string;
  /** Normalized window pointer, owned by the hero so one listener serves both. */
  pointer?: MutableRefObject<NormalizedPointer>;
  reducedMotion?: boolean;
  /** Delay before the exhibit begins to emerge, in seconds. */
  entranceDelay?: number;
}

const DEFAULT_HERO_MODEL_PATH = '/models/dinosaurs/velociraptor/model.glb';

function isMeshObject(node: Object3D): node is Mesh {
  return (node as Mesh).isMesh === true;
}

/** Seconds the specimen takes to settle into its plinth. */
const ENTRANCE_DURATION = 0.9;

/** Parallax authority: yaw ±4°, pitch ±2°. */
const YAW_RANGE = 0.07;
const PITCH_RANGE = 0.035;

/** Damped follow rate — heavy, physical, never mouse-tracking. */
const PARALLAX_DAMPING = 2.8;

/** Imperceptible idle sway. Deliberately below the threshold of "breathing". */
const IDLE_YAW = 0.008;
const IDLE_LIFT = 0.004;
const IDLE_SPEED = 0.34;

// Preload the hero asset for immediate readiness
useGLTF.preload(DEFAULT_HERO_MODEL_PATH);

/**
 * Art-directed 3D dinosaur specimen for the homepage exhibition hero.
 *
 * Responsibilities:
 * - Loads the Velociraptor GLB asset asynchronously
 * - Safely clones scene hierarchy and configures mesh shadow casting/receiving
 * - Sets the model's natural center-of-mass pivot around the torso/hips
 * - Art-directs the 3/4 predatory stance facing towards the headline
 * - Rises out of darkness with a small positional settle (no spin, no scale-up)
 * - Implements subtle, damped pointer parallax plus near-invisible idle sway
 * - Provides responsive composition adjustments between desktop and mobile
 *
 * All movement is driven inside a single `useFrame`, so React never re-renders
 * for animation and the model is never remounted.
 */
export const HeroDinosaur: FC<HeroDinosaurProps> = ({
  src = DEFAULT_HERO_MODEL_PATH,
  pointer,
  reducedMotion = false,
  entranceDelay = 0.4,
}) => {
  const groupRef = useRef<Group>(null);
  const { size } = useThree();
  const gltf = useGLTF(src);

  // Safely clone and configure mesh shadows; dispose keeps navigation leak-free.
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

  useEffect(() => {
    return () => {
      // Clones share geometry/materials with the drei-cached GLTF, so only the
      // clone hierarchy is released — never the cached source meshes.
      clonedScene.clear();
    };
  }, [clonedScene]);

  // Responsive art direction targets
  const isMobile = size.width < 960;

  // Desktop: right of the headline (x = 1.28), 3/4 stance (-0.8 rad yaw),
  // snout prominent with the tail cropped into darkness.
  // Mobile: centered in its own exhibition viewport, cinematic closeup.
  const basePosition: [number, number, number] = isMobile ? [0.08, -0.28, 0] : [1.28, -0.2, 0];
  const baseRotation: [number, number, number] = isMobile ? [-0.03, -0.44, 0] : [-0.04, -0.8, 0.02];
  const baseScale = isMobile ? 1.22 : 1.52;

  // Mutable animation state, kept out of React state to avoid re-renders.
  const elapsed = useRef(0);
  const parallax = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // Clamp delta so a tab restored after backgrounding doesn't jump the motion.
    const step = Math.min(delta, 0.05);

    if (reducedMotion) {
      group.position.set(basePosition[0], basePosition[1], basePosition[2]);
      group.rotation.set(baseRotation[0], baseRotation[1], baseRotation[2]);
      return;
    }

    elapsed.current += step;

    // --- Entrance: rise a few centimetres out of the dark, then settle. ---
    const entranceElapsed = elapsed.current - entranceDelay;
    const rawProgress = MathUtils.clamp(entranceElapsed / ENTRANCE_DURATION, 0, 1);
    const entered = 1 - Math.pow(1 - rawProgress, 3);

    // --- Pointer parallax, damped for mass. ---
    const pointerX = pointer?.current.x ?? state.pointer.x;
    const pointerY = pointer?.current.y ?? state.pointer.y;

    const targetRotY = baseRotation[1] + pointerX * YAW_RANGE;
    const targetRotX = baseRotation[0] - pointerY * PITCH_RANGE;

    parallax.current.x = MathUtils.lerp(
      parallax.current.x,
      targetRotY,
      1 - Math.exp(-step * PARALLAX_DAMPING)
    );
    parallax.current.y = MathUtils.lerp(
      parallax.current.y,
      targetRotX,
      1 - Math.exp(-step * PARALLAX_DAMPING)
    );

    // --- Idle sway, applied on top of parallax and ramped with the entrance. ---
    const idleYaw = Math.sin(elapsed.current * IDLE_SPEED) * IDLE_YAW;
    const idleLift = Math.sin(elapsed.current * IDLE_SPEED * 0.8) * IDLE_LIFT;

    group.rotation.y = parallax.current.x + idleYaw * entered;
    group.rotation.x = parallax.current.y;
    group.rotation.z = baseRotation[2];

    // Settle down onto the plinth from slightly higher — a museum hoist, not a fly-in.
    group.position.y = basePosition[1] + (1 - entered) * 0.16 + idleLift * entered;
    group.position.x = basePosition[0];
  });

  return (
    <group
      ref={groupRef}
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
