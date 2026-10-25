import { Suspense, type FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export const AppLayout: FC = () => {
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
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};
