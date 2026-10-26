import { useRef, type FC } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, type DirectionalLight, type HemisphereLight } from 'three';
import type { AppTheme, GraphicsQuality } from '@/store/useAppSettings';

export interface DinosaurMuseumLightingProps {
  quality?: GraphicsQuality;
  theme?: AppTheme;
  /** Seconds to wait before the exhibit lighting begins to come up. */
  revealDelay?: number;
  /** Skip the reveal ramp (reduced motion / already-lit states). */
  instant?: boolean;
}

interface ViewerPreset {
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  keyIntensity: number;
  keyColor: string;
  fillIntensity: number;
  fillColor: string;
  rimIntensity: number;
  rimColor: string;
}

const VIEWER_PRESETS: Record<AppTheme, ViewerPreset> = {
  dark: {
    hemiSky: '#e8e2d5',
    hemiGround: '#141210',
    hemiIntensity: 0.55,
    keyIntensity: 2.2,
    keyColor: '#f3ead8',
    fillIntensity: 0.65,
    fillColor: '#8fa0b5',
    rimIntensity: 1.15,
    rimColor: '#d0a35d',
  },
  light: {
    hemiSky: '#f6f1e6',
    hemiGround: '#c8beab',
    hemiIntensity: 0.72,
    keyIntensity: 1.95,
    keyColor: '#fff8eb',
    fillIntensity: 0.5,
    fillColor: '#9c9282',
    rimIntensity: 1.05,
    rimColor: '#9d7432',
  },
};

/** Seconds for the specimen lighting to come up from black. */
const REVEAL_DURATION = 1.0;

/** Theme cross-fade window, matching the CSS theme transition. */
const THEME_TRANSITION_DURATION = 0.42;

/**
 * Theme-aware museum lighting for the detail-page specimen pavilion.
 *
 * On mount the lights ramp up from black — the "preparing the digital
 * specimen" gesture — then hold. A theme switch cross-fades between presets
 * without remounting any light, so the visitor's OrbitControls camera state and
 * the current animation clip are never disturbed.
 *
 * This component never moves the camera: after entry, control belongs entirely
 * to the visitor.
 */
export const DinosaurMuseumLighting: FC<DinosaurMuseumLightingProps> = ({
  quality = 'high',
  theme = 'dark',
  revealDelay = 0.15,
  instant = false,
}) => {
  const castShadows = quality !== 'low';
  const shadowMapSize = quality === 'high' ? 1024 : 512;

  const hemiRef = useRef<HemisphereLight>(null);
  const keyRef = useRef<DirectionalLight>(null);
  const fillRef = useRef<DirectionalLight>(null);
  const rimRef = useRef<DirectionalLight>(null);

  const elapsed = useRef(instant ? REVEAL_DURATION + revealDelay : 0);

  const startPreset = VIEWER_PRESETS[theme] ?? VIEWER_PRESETS.dark;
  const live = useRef({
    hemiIntensity: startPreset.hemiIntensity,
    keyIntensity: startPreset.keyIntensity,
    fillIntensity: startPreset.fillIntensity,
    rimIntensity: startPreset.rimIntensity,
    hemiSky: startPreset.hemiSky,
    keyColor: startPreset.keyColor,
    fillColor: startPreset.fillColor,
    rimColor: startPreset.rimColor,
  });

  const targetPreset = VIEWER_PRESETS[theme] ?? VIEWER_PRESETS.dark;

  useFrame((_, delta) => {
    if (instant) {
      return;
    }

    const step = Math.min(delta, 0.05);

    // Reveal ramp
    if (elapsed.current < revealDelay + REVEAL_DURATION) {
      elapsed.current += step;
    }
    const rawReveal = MathUtils.clamp((elapsed.current - revealDelay) / REVEAL_DURATION, 0, 1);
    const reveal = 1 - Math.pow(1 - rawReveal, 2);

    // Theme cross-fade
    const blend = 1 - Math.exp(-step / (THEME_TRANSITION_DURATION / 3));
    const value = live.current;
    value.hemiIntensity = MathUtils.lerp(value.hemiIntensity, targetPreset.hemiIntensity, blend);
    value.keyIntensity = MathUtils.lerp(value.keyIntensity, targetPreset.keyIntensity, blend);
    value.fillIntensity = MathUtils.lerp(value.fillIntensity, targetPreset.fillIntensity, blend);
    value.rimIntensity = MathUtils.lerp(value.rimIntensity, targetPreset.rimIntensity, blend);

    if (hemiRef.current) {
      hemiRef.current.intensity = value.hemiIntensity;
    }
    if (keyRef.current) {
      keyRef.current.intensity = value.keyIntensity * reveal;
    }
    if (fillRef.current) {
      fillRef.current.intensity = value.fillIntensity * reveal;
    }
    if (rimRef.current) {
      rimRef.current.intensity = value.rimIntensity * reveal;
    }
  });

  return (
    <>
      {/* Subtle museum ambient & ground bounce */}
      <hemisphereLight
        ref={hemiRef}
        args={[startPreset.hemiSky, startPreset.hemiGround, startPreset.hemiIntensity]}
      />

      {/* Warm museum key spotlight */}
      <directionalLight
        ref={keyRef}
        position={[4.5, 6.5, 4.0]}
        intensity={instant ? startPreset.keyIntensity : 0}
        color={startPreset.keyColor}
        castShadow={castShadows}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-3.5}
        shadow-bias={-0.0005}
      />

      {/* Archival shadow fill */}
      <directionalLight
        ref={fillRef}
        position={[-4.5, 2.8, 2.5]}
        intensity={instant ? startPreset.fillIntensity : 0}
        color={startPreset.fillColor}
      />

      {/* Warm brass back rim light for silhouette separation */}
      <directionalLight
        ref={rimRef}
        position={[0, 4.2, -5.0]}
        intensity={instant ? startPreset.rimIntensity : 0}
        color={startPreset.rimColor}
      />
    </>
  );
};
