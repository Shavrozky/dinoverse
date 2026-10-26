import { useRef, type FC, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, MathUtils, type AmbientLight, type DirectionalLight } from 'three';
import type { AppTheme } from '@/store/useAppSettings';
import type { NormalizedPointer } from '@/hooks';

export interface HeroMuseumLightingProps {
  reducedMotion?: boolean;
  theme?: AppTheme;
  /** Normalized window pointer, owned by the hero so one listener serves both. */
  pointer?: MutableRefObject<NormalizedPointer>;
  /** Seconds to wait before the exhibit lighting begins to come up. */
  revealDelay?: number;
}

interface LightingPreset {
  ambientIntensity: number;
  ambientColor: string;
  keyIntensity: number;
  keyColor: string;
  rimIntensity: number;
  rimColor: string;
  fillIntensity: number;
  fillColor: string;
}

const LIGHTING_PRESETS: Record<AppTheme, LightingPreset> = {
  dark: {
    ambientIntensity: 0.16,
    ambientColor: '#1c1916',
    keyIntensity: 2.2,
    keyColor: '#fbf4ea',
    rimIntensity: 3.6,
    rimColor: '#d4af37',
    fillIntensity: 0.65,
    fillColor: '#7d92a4',
  },
  light: {
    ambientIntensity: 0.44,
    ambientColor: '#d8cfbe',
    keyIntensity: 1.95,
    keyColor: '#fff9ee',
    rimIntensity: 2.2,
    rimColor: '#9d7432',
    fillIntensity: 0.38,
    fillColor: '#8a7e6b',
  },
};

/** Seconds for the exhibit lighting to come up from black. */
const REVEAL_DURATION = 1.15;

/** Seconds for a theme switch to cross-fade. Matches the CSS theme window. */
const THEME_TRANSITION_DURATION = 0.42;

/** Rim light pointer travel, in world units. Deliberately tiny. */
const RIM_TRAVEL = 0.85;

const KEY_POSITION: [number, number, number] = [3.2, 4.2, 3.6];
const RIM_POSITION: [number, number, number] = [2.4, 3.0, -4.0];
const FILL_POSITION: [number, number, number] = [-3.6, 1.4, 2.6];

/**
 * Theme-aware editorial museum lighting for the Homepage Hero exhibition.
 * - Dark Museum: Deep carbon void, warm ivory key, strong golden rim, dramatic shadows.
 * - Archive Light: Warm archival studio lighting with restrained fill for ink-like contrast.
 *
 * Two independent interpolations run inside a single `useFrame`:
 * 1. Reveal — the exhibit coming up from darkness, once, on mount.
 * 2. Theme — a cross-fade between presets when the visitor switches theme.
 *
 * Lights are never remounted and their JSX props are static: every animated
 * value is written imperatively to the existing light objects, so a theme
 * switch cannot reset the reveal and R3F never re-creates a light.
 */
export const HeroMuseumLighting: FC<HeroMuseumLightingProps> = ({
  reducedMotion = false,
  theme = 'dark',
  pointer,
  revealDelay = 0.38,
}) => {
  const ambientLightRef = useRef<AmbientLight>(null);
  const keyLightRef = useRef<DirectionalLight>(null);
  const rimLightRef = useRef<DirectionalLight>(null);
  const fillLightRef = useRef<DirectionalLight>(null);

  /**
   * Reveal progress in [0, 1] over REVEAL_DURATION seconds, after revealDelay.
   * Reduced motion starts fully lit so the exhibit is simply present.
   */
  const revealElapsed = useRef(reducedMotion ? REVEAL_DURATION + revealDelay : 0);

  // Live (interpolated) values, seeded from whichever theme mounted first.
  const startPreset = LIGHTING_PRESETS[theme] ?? LIGHTING_PRESETS.dark;
  const live = useRef({
    ambientIntensity: startPreset.ambientIntensity,
    keyIntensity: startPreset.keyIntensity,
    rimIntensity: startPreset.rimIntensity,
    fillIntensity: startPreset.fillIntensity,
    ambientColor: new Color(startPreset.ambientColor),
    keyColor: new Color(startPreset.keyColor),
    rimColor: new Color(startPreset.rimColor),
    fillColor: new Color(startPreset.fillColor),
  });

  // Target values for the active theme.
  const targetPreset = LIGHTING_PRESETS[theme] ?? LIGHTING_PRESETS.dark;
  const target = useRef({
    ambientColor: new Color(targetPreset.ambientColor),
    keyColor: new Color(targetPreset.keyColor),
    rimColor: new Color(targetPreset.rimColor),
    fillColor: new Color(targetPreset.fillColor),
  });
  target.current.ambientColor.set(targetPreset.ambientColor);
  target.current.keyColor.set(targetPreset.keyColor);
  target.current.rimColor.set(targetPreset.rimColor);
  target.current.fillColor.set(targetPreset.fillColor);

  useFrame((_, delta) => {
    // Clamp so a tab restored from background doesn't snap the reveal to done.
    const step = Math.min(delta, 0.05);

    // --- 1. Reveal ramp -------------------------------------------------
    if (revealElapsed.current < revealDelay + REVEAL_DURATION) {
      revealElapsed.current += step;
    }
    const rawReveal = MathUtils.clamp(
      (revealElapsed.current - revealDelay) / REVEAL_DURATION,
      0,
      1
    );
    // Ease-out: museum lights come up, they do not snap on.
    const reveal = reducedMotion ? 1 : 1 - Math.pow(1 - rawReveal, 2);

    // --- 2. Theme cross-fade --------------------------------------------
    // Exponential damping with a time constant of a third of the transition,
    // so the cross-fade visually completes in ~THEME_TRANSITION_DURATION.
    const blend = reducedMotion ? 1 : 1 - Math.exp(-step / (THEME_TRANSITION_DURATION / 3));

    const value = live.current;
    value.ambientIntensity = MathUtils.lerp(
      value.ambientIntensity,
      targetPreset.ambientIntensity,
      blend
    );
    value.keyIntensity = MathUtils.lerp(value.keyIntensity, targetPreset.keyIntensity, blend);
    value.rimIntensity = MathUtils.lerp(value.rimIntensity, targetPreset.rimIntensity, blend);
    value.fillIntensity = MathUtils.lerp(value.fillIntensity, targetPreset.fillIntensity, blend);
    value.ambientColor.lerp(target.current.ambientColor, blend);
    value.keyColor.lerp(target.current.keyColor, blend);
    value.rimColor.lerp(target.current.rimColor, blend);
    value.fillColor.lerp(target.current.fillColor, blend);

    // --- 3. Write to the live lights, scaled by the reveal factor --------
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = value.ambientIntensity;
      ambientLightRef.current.color.copy(value.ambientColor);
    }

    if (keyLightRef.current) {
      keyLightRef.current.intensity = value.keyIntensity * reveal;
      keyLightRef.current.color.copy(value.keyColor);
    }

    if (fillLightRef.current) {
      fillLightRef.current.intensity = value.fillIntensity * reveal;
      fillLightRef.current.color.copy(value.fillColor);
    }

    if (rimLightRef.current) {
      rimLightRef.current.intensity = value.rimIntensity * reveal;
      rimLightRef.current.color.copy(value.rimColor);

      // Optional, extremely small rim response to pointer — the lighting rig
      // shifting, not a flashlight chasing the cursor.
      const pointerX = reducedMotion ? 0 : (pointer?.current.x ?? 0);
      const targetX = RIM_POSITION[0] + pointerX * RIM_TRAVEL;
      const targetY = RIM_POSITION[1] + pointerX * RIM_TRAVEL * 0.3;
      const follow = 1 - Math.exp(-step * 1.5);

      rimLightRef.current.position.x = MathUtils.lerp(
        rimLightRef.current.position.x,
        targetX,
        follow
      );
      rimLightRef.current.position.y = MathUtils.lerp(
        rimLightRef.current.position.y,
        targetY,
        follow
      );
    }
  });

  return (
    <>
      <ambientLight
        ref={ambientLightRef}
        intensity={startPreset.ambientIntensity}
        color={startPreset.ambientColor}
      />

      <directionalLight
        ref={keyLightRef}
        position={KEY_POSITION}
        intensity={reducedMotion ? startPreset.keyIntensity : 0}
        color={startPreset.keyColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      <directionalLight
        ref={rimLightRef}
        position={RIM_POSITION}
        intensity={reducedMotion ? startPreset.rimIntensity : 0}
        color={startPreset.rimColor}
      />

      <directionalLight
        ref={fillLightRef}
        position={FILL_POSITION}
        intensity={reducedMotion ? startPreset.fillIntensity : 0}
        color={startPreset.fillColor}
      />
    </>
  );
};
