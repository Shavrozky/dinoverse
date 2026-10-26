import { Box3, Vector3, type Object3D } from 'three';

export interface BoundingBoxData {
  min: [number, number, number];
  max: [number, number, number];
  size: [number, number, number];
  center: [number, number, number];
  maxDimension: number;
}

export interface NormalizedModelTransform {
  scale: number;
  position: [number, number, number];
  normalizedSize: [number, number, number];
  orbitTarget: [number, number, number];
}

export interface CameraFramingConfig {
  position: [number, number, number];
  target: [number, number, number];
  minDistance: number;
  maxDistance: number;
}

export interface SpecimenAnimationAction {
  id: string;
  label: string;
  clipName: string;
}

const DEFAULT_TARGET_MAX_DIMENSION = 3.8;

/**
 * Measures the world-space axis-aligned bounding box of a Three.js Object3D.
 */
export function measureObjectBounds(object: Object3D): BoundingBoxData {
  object.updateMatrixWorld(true);
  const box = new Box3().setFromObject(object);

  if (box.isEmpty()) {
    return {
      min: [-0.5, 0, -0.5],
      max: [0.5, 1, 0.5],
      size: [1, 1, 1],
      center: [0, 0.5, 0],
      maxDimension: 1,
    };
  }

  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxDimension = Math.max(size.x, size.y, size.z, 0.001);

  return {
    min: [box.min.x, box.min.y, box.min.z],
    max: [box.max.x, box.max.y, box.max.z],
    size: [size.x, size.y, size.z],
    center: [center.x, center.y, center.z],
    maxDimension,
  };
}

/**
 * Pure helper that computes a uniform scale and grounded translation so that:
 * - The model fits within `targetMaxDimension` without distortion
 * - X and Z are centered at 0
 * - The lowest point (min.y) rests cleanly on the exhibition floor (Y = 0)
 */
export function calculateNormalizedTransform(
  bounds: BoundingBoxData,
  targetMaxDimension = DEFAULT_TARGET_MAX_DIMENSION
): NormalizedModelTransform {
  const safeMax = Math.max(bounds.maxDimension, 0.001);
  const scale = targetMaxDimension / safeMax;

  const cleanZero = (value: number): number => (Object.is(value, -0) ? 0 : value);

  const posX = cleanZero(-bounds.center[0] * scale);
  const posY = cleanZero(-bounds.min[1] * scale);
  const posZ = cleanZero(-bounds.center[2] * scale);

  const normalizedWidth = bounds.size[0] * scale;
  const normalizedHeight = bounds.size[1] * scale;
  const normalizedDepth = bounds.size[2] * scale;

  const orbitTargetY = Math.max(normalizedHeight * 0.44, 0.35);

  return {
    scale,
    position: [posX, posY, posZ],
    normalizedSize: [normalizedWidth, normalizedHeight, normalizedDepth],
    orbitTarget: [0, orbitTargetY, 0],
  };
}

/**
 * Pure helper that computes an adaptive museum camera position and zoom bounds
 * from the normalized model dimensions and camera field of view.
 */
export function calculateCameraFraming(
  normalizedSize: [number, number, number],
  fovDegrees = 40,
  aspect = 1.45
): CameraFramingConfig {
  const [width, height, depth] = normalizedSize;
  const maxHorizontal = Math.max(width, depth, 1);
  const effectiveRadius = Math.max(maxHorizontal * 0.55, height * 0.6, 0.8);

  const fovRad = (fovDegrees * Math.PI) / 180;
  const verticalFitDistance = effectiveRadius / Math.tan(fovRad / 2);
  const horizontalFov = 2 * Math.atan(Math.tan(fovRad / 2) * Math.max(aspect, 0.65));
  const horizontalFitDistance = effectiveRadius / Math.tan(horizontalFov / 2);

  const baseDistance = Math.max(verticalFitDistance, horizontalFitDistance) * 1.18;
  const targetY = Math.max(height * 0.44, 0.35);

  // Position camera at an editorial 3/4 museum profile angle
  const azimuthAngle = Math.PI * 0.32;
  const elevationOffset = height * 0.24;

  const camX = Math.sin(azimuthAngle) * baseDistance;
  const camY = targetY + elevationOffset;
  const camZ = Math.cos(azimuthAngle) * baseDistance;

  return {
    position: [Number(camX.toFixed(3)), Number(camY.toFixed(3)), Number(camZ.toFixed(3))],
    target: [0, Number(targetY.toFixed(3)), 0],
    minDistance: Number(Math.max(effectiveRadius * 0.85, 1.2).toFixed(2)),
    maxDistance: Number(Math.max(baseDistance * 2.2, 6.5).toFixed(2)),
  };
}

/**
 * Maps raw GLTF animation clip names into ordered museum control actions.
 */
export function resolveAnimationActions(clipNames: readonly string[]): SpecimenAnimationAction[] {
  const uniqueNames = Array.from(new Set(clipNames.filter(Boolean)));
  if (uniqueNames.length === 0) {
    return [];
  }

  const priorityOrder = ['idle', 'walk', 'run', 'roar', 'attack'];

  return uniqueNames
    .map((clipName) => {
      const lower = clipName.toLowerCase();
      let label = clipName.toUpperCase();
      if (lower.includes('idle') || lower.includes('stand') || lower.includes('breath')) {
        label = 'IDLE';
      } else if (lower.includes('walk') || lower.includes('stride')) {
        label = 'WALK';
      } else if (lower.includes('roar') || lower.includes('call') || lower.includes('vocal')) {
        label = 'ROAR';
      }
      return {
        id: lower,
        label,
        clipName,
      };
    })
    .sort((a, b) => {
      const idxA = priorityOrder.findIndex((key) => a.id.includes(key));
      const idxB = priorityOrder.findIndex((key) => b.id.includes(key));
      const rankA = idxA === -1 ? 99 : idxA;
      const rankB = idxB === -1 ? 99 : idxB;
      return rankA - rankB;
    });
}
