import { useGLTF } from '@react-three/drei';

/**
 * Contextually preloads a dinosaur GLTF/GLB asset into Drei's cache.
 */
export function preloadDinosaurModel(modelPath?: string): void {
  if (!modelPath) return;
  useGLTF.preload(modelPath);
}
