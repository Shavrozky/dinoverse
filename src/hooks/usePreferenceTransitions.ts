import { useEffect } from 'react';

const THEME_TRANSITION_CLASS = 'theme-transition';
const THEME_TRANSITION_MS = 420;

const LANGUAGE_INK_CLASS = 'lang-swap';
const LANGUAGE_INK_MS = 220;

/**
 * Adds a short-lived class to <html> that lets the browser interpolate theme
 * colour properties across the whole document.
 *
 * A permanent global colour transition would make every hover feel sluggish,
 * so the capability is scoped to the ~420ms window of an actual theme change.
 * Skipped on the first mount so the initial paint never fades in.
 */
export function useThemeTransition(theme: string): void {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(THEME_TRANSITION_CLASS);

    const timer = window.setTimeout(() => {
      root.classList.remove(THEME_TRANSITION_CLASS);
    }, THEME_TRANSITION_MS);

    return () => {
      window.clearTimeout(timer);
      root.classList.remove(THEME_TRANSITION_CLASS);
    };
  }, [theme]);
}

/**
 * Soft re-ink of the document's text when the archive language changes.
 *
 * The translation swap itself is instant (it must not be delayed); this only
 * animates the *text* elements' opacity so the new wording settles rather than
 * snapping. The 3D canvas and layout are untouched, so no viewer state is lost.
 */
export function useLanguageInk(language: string): void {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(LANGUAGE_INK_CLASS);

    // Force a style flush so the animation restarts on rapid EN/ID toggling.
    void root.offsetWidth;
    root.classList.add(LANGUAGE_INK_CLASS);

    const timer = window.setTimeout(() => {
      root.classList.remove(LANGUAGE_INK_CLASS);
    }, LANGUAGE_INK_MS);

    return () => {
      window.clearTimeout(timer);
      root.classList.remove(LANGUAGE_INK_CLASS);
    };
  }, [language]);
}
