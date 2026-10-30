import {
  useState,
  type FC,
} from 'react';

import { useReducedMotionPreference } from '@/hooks';

import styles from './MuseumHero.module.css';

const HERO_VIDEO =
  '/videos/hero/brachiosaurus-lake.mp4';

const HERO_POSTER =
  '/videos/hero/brachiosaurus-lake-poster.jpg';

export const HeroBackgroundVideo: FC = () => {
  const prefersReducedMotion =
    useReducedMotionPreference();

  const [isReady, setIsReady] =
    useState(false);

  if (prefersReducedMotion) {
    return (
      <div
        className={styles.heroVideoFallback}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={styles.heroVideoLayer}
      aria-hidden="true"
    >
      <video
        className={`${styles.heroVideo} ${
          isReady
            ? styles.heroVideoReady
            : ''
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={HERO_POSTER}
        tabIndex={-1}
        onCanPlay={() => {
          setIsReady(true);
        }}
      >
        <source
          src={HERO_VIDEO}
          type="video/mp4"
        />
      </video>

      <div
        className={styles.heroVideoScrim}
      />

      <div
        className={styles.heroVideoVignette}
      />
    </div>
  );
};