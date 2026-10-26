import { Suspense, useEffect, type FC } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RouteTransition } from '@/components/layout/RouteTransition';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useLanguageInk, useThemeTransition } from '@/hooks';
import { useAppSettings } from '@/store';

/**
 * Scroll to the top on navigation.
 *
 * Deliberately not `ScrollRestoration`: this app's pages own their own scroll
 * position (Explore restores filters from the URL, not a scroll offset), and a
 * smooth `scroll-behavior` would animate the jump and fight the route
 * crossfade. An instant reset on pathname change keeps arrival predictable.
 *
 * The location `key` is used rather than `pathname` so that navigating from
 * one specimen to the next (/dinosaur/a → /dinosaur/b) also resets.
 */
const useScrollToTopOnNavigate = (key: string): void => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [key]);
};

export const AppLayout: FC = () => {
  const location = useLocation();
  const theme = useAppSettings((state) => state.theme);
  const language = useAppSettings((state) => state.language);

  useThemeTransition(theme);
  useLanguageInk(language);
  useScrollToTopOnNavigate(location.key);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<LoadingScreen fullscreen message="Loading page..." />}>
          <RouteTransition />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};
