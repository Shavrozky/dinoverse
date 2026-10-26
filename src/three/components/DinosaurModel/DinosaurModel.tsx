import { useEffect, useMemo, useRef, type FC } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { Mesh, type Group, type Object3D } from 'three';
import { SkeletonUtils } from 'three-stdlib';
import {
  calculateNormalizedTransform,
  measureObjectBounds,
  resolveAnimationActions,
  type NormalizedModelTransform,
  type SpecimenAnimationAction,
} from '../../utils';

export interface DinosaurModelReadyPayload {
  transform: NormalizedModelTransform;
  actions: SpecimenAnimationAction[];
}

export interface DinosaurModelProps {
  src: string;
  activeClipName: string | null;
  reducedMotion?: boolean;
  onModelReady?: (payload: DinosaurModelReadyPayload) => void;
}

function isMeshObject(node: Object3D): node is Mesh {
  return (node as Mesh).isMesh === true;
}

export const DinosaurModel: FC<DinosaurModelProps> = ({
  src,
  activeClipName,
  reducedMotion = false,
  onModelReady,
}) => {
  const groupRef = useRef<Group>(null);
  const gltf = useGLTF(src);

  const { clonedScene, transform } = useMemo(() => {
    const cloned = SkeletonUtils.clone(gltf.scene);

    cloned.traverse((node) => {
      if (isMeshObject(node)) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    const bounds = measureObjectBounds(cloned);
    const normalized = calculateNormalizedTransform(bounds);

    return {
      clonedScene: cloned,
      transform: normalized,
    };
  }, [gltf.scene]);

  const availableActions = useMemo(() => {
    const clipNames = (gltf.animations ?? []).map((clip) => clip.name);
    return resolveAnimationActions(clipNames);
  }, [gltf.animations]);

  const { actions: mixerActions } = useAnimations(gltf.animations ?? [], groupRef);

  useEffect(() => {
    onModelReady?.({
      transform,
      actions: availableActions,
    });
  }, [transform, availableActions, onModelReady]);

  useEffect(() => {
    const allActions = Object.values(mixerActions).filter(Boolean);
    if (allActions.length === 0) {
      return;
    }

    if (reducedMotion || !activeClipName) {
      allActions.forEach((action) => action?.fadeOut(0.25));
      return;
    }

    const nextAction = mixerActions[activeClipName];
    if (!nextAction) {
      return;
    }

    allActions.forEach((action) => {
      if (action && action !== nextAction && action.isRunning()) {
        action.fadeOut(0.35);
      }
    });

    nextAction.reset().fadeIn(0.35).play();

    return () => {
      nextAction.fadeOut(0.25);
    };
  }, [activeClipName, mixerActions, reducedMotion]);

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={clonedScene} scale={transform.scale} position={transform.position} />
    </group>
  );
};
