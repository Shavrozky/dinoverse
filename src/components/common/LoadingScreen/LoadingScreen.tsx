import type { FC } from 'react';

interface LoadingScreenProps {
  message?: string;
  fullscreen?: boolean;
}

export const LoadingScreen: FC<LoadingScreenProps> = ({
  message = 'Loading prehistoric world...',
  fullscreen = false,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullscreen ? '100vh' : '280px',
        width: '100%',
        padding: '2rem',
        color: 'var(--color-text-secondary)',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid var(--color-surface-border)',
          borderTopColor: 'var(--color-accent)',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ fontSize: 'var(--font-size-sm)', letterSpacing: '0.05em' }}>{message}</p>
    </div>
  );
};
