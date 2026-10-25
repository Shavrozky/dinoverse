import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from '@/components/ui';
import { useAppSettings } from '@/store';
import styles from './Navbar.module.css';

export const Navbar: FC = () => {
  const { soundEnabled, toggleSound } = useAppSettings();

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.inner}>
          <NavLink to="/" className={styles.brand} aria-label="DinoVerse Home">
            <span className={styles.brandTitle}>DINOVERSE</span>
            <span className={styles.brandSubtitle}>PALEONTOLOGY ARCHIVE</span>
          </NavLink>

          <nav aria-label="Main Navigation" className={styles.nav}>
            <NavLink
              to="/explore"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
            >
              <span className={styles.navIndex}>01</span>
              <span>Explore</span>
            </NavLink>

            <NavLink
              to="/timeline"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
            >
              <span className={styles.navIndex}>02</span>
              <span>Timeline</span>
            </NavLink>

            <NavLink
              to="/compare"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
            >
              <span className={styles.navIndex}>03</span>
              <span>Compare</span>
            </NavLink>

            <button
              onClick={toggleSound}
              aria-label={soundEnabled ? 'Mute exhibition sound' : 'Enable exhibition sound'}
              title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
              className={styles.audioButton}
            >
              <span>AUDIO</span>
              <span className={styles.audioIndicator}>{soundEnabled ? '◉' : '○'}</span>
            </button>
          </nav>
        </div>
      </Container>
    </header>
  );
};
