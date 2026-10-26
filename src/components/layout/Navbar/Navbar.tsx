import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui';
import { useReducedMotionPreference, useScrolled } from '@/hooks';
import { useTranslation } from '@/i18n';
import { motionDurations, motionEasing } from '@/lib/motion';
import { useAppSettings } from '@/store';
import styles from './Navbar.module.css';

interface NavItem {
  to: string;
  index: string;
  label: string;
}

export const Navbar: FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const theme = useAppSettings((state) => state.theme);
  const toggleTheme = useAppSettings((state) => state.toggleTheme);
  const soundEnabled = useAppSettings((state) => state.soundEnabled);
  const toggleSound = useAppSettings((state) => state.toggleSound);

  const prefersReducedMotion = useReducedMotionPreference();
  const isScrolled = useScrolled(12);
  const isLightTheme = theme === 'light';

  const navItems: NavItem[] = [
    { to: '/explore', index: '01', label: t.nav.explore },
    { to: '/timeline', index: '02', label: t.nav.timeline },
    { to: '/compare', index: '03', label: t.nav.compare },
  ];

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <Container>
        <div className={styles.inner}>
          <NavLink to="/" className={styles.brand} aria-label={t.nav.brandAriaLabel}>
            <span className={styles.brandTitle}>DINOVERSE</span>
            <span className={styles.brandSubtitle}>{t.nav.brandSubtitle}</span>
          </NavLink>

          <nav aria-label={t.nav.mainNavAriaLabel} className={styles.nav}>
            <div className={styles.navLinks}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={styles.navIndex}>{item.index}</span>
                      <span>{item.label}</span>
                      {/*
                        Brass active rule. Drawn as a scaleX transform on mount
                        rather than a width change, so the active state never
                        triggers layout work when navigating.
                      */}
                      {isActive &&
                        (prefersReducedMotion ? (
                          <span className={styles.activeRule} aria-hidden="true" />
                        ) : (
                          <motion.span
                            className={styles.activeRule}
                            aria-hidden="true"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{
                              duration: motionDurations.normal,
                              ease: motionEasing.museum,
                            }}
                          />
                        ))}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className={styles.controlsCluster}>
              {/* Language Switcher: EN | ID */}
              <div className={styles.langSwitch} role="group" aria-label={t.nav.languageGroupAria}>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  aria-label={t.nav.switchToEnglish}
                  aria-pressed={language === 'en'}
                  className={`${styles.langOption} ${language === 'en' ? styles.langOptionActive : ''}`}
                >
                  EN
                </button>
                <span className={styles.langDivider} aria-hidden="true">
                  |
                </span>
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  aria-label={t.nav.switchToIndonesian}
                  aria-pressed={language === 'id'}
                  className={`${styles.langOption} ${language === 'id' ? styles.langOptionActive : ''}`}
                >
                  ID
                </button>
              </div>

              {/* Theme Toggle: Dark Museum / Archive Light */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isLightTheme ? t.nav.switchToDarkTheme : t.nav.switchToLightTheme}
                aria-pressed={isLightTheme}
                title={isLightTheme ? t.nav.switchToDarkTheme : t.nav.switchToLightTheme}
                className={styles.controlButton}
              >
                <span className={styles.controlLabel}>
                  {isLightTheme ? t.nav.themeLight : t.nav.themeDark}
                </span>
                <span className={styles.controlIndicator} aria-hidden="true">
                  ◐
                </span>
              </button>

              {/* Audio Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                aria-label={soundEnabled ? t.nav.muteSound : t.nav.enableSound}
                aria-pressed={soundEnabled}
                title={soundEnabled ? t.nav.soundEnabledTitle : t.nav.soundMutedTitle}
                className={styles.controlButton}
              >
                <span className={styles.controlLabel}>{t.nav.audio}</span>
                <span className={styles.controlIndicator} aria-hidden="true">
                  {soundEnabled ? '◉' : '○'}
                </span>
              </button>
            </div>
          </nav>
        </div>
      </Container>
    </header>
  );
};
