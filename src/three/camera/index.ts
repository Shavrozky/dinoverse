export interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  position: [number, number, number];
}

export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  fov: 45,
  near: 0.1,
  far: 1000,
  position: [0, 0, 5],
};
