import type { FC } from 'react';
import { Container } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';

export const ComparePage: FC = () => {
  useDocumentTitle('Size Comparison — Comparative Morphometrics');

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-24)' }}>
      <Container>
        <header
          style={{
            marginBottom: 'var(--space-12)',
            paddingBottom: 'var(--space-8)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-family-label)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-widest)',
              color: 'var(--warm-brass)',
              display: 'block',
              marginBottom: 'var(--space-2)',
            }}
          >
            Comparative Morphometrics
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-family-serif)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              color: 'var(--bone-white)',
              lineHeight: 1.05,
              marginBottom: 'var(--space-3)',
            }}
          >
            Specimen Scale Comparison
          </h1>
          <p style={{ color: 'var(--fossil-stone)', maxWidth: '640px', lineHeight: 1.7 }}>
            Side-by-side anatomical dimensions and mass ratios comparing prehistoric megafauna with
            modern reference scales. Interactive 3D scale viewport scheduled for Phase 3.
          </p>
        </header>

        <div
          style={{
            padding: 'var(--space-16) var(--space-8)',
            backgroundColor: 'var(--museum-surface)',
            border: '1px dashed var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '3rem',
              display: 'block',
              marginBottom: 'var(--space-4)',
              opacity: 0.6,
            }}
          >
            🦕 🧍 🦖
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-family-serif)',
              fontSize: 'var(--font-size-2xl)',
              color: 'var(--bone-white)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Morphometric Viewport Under Curation
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              maxWidth: '520px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Multi-specimen 3D comparison scene, skeletal scale overlays, and biomechanical ratios
            will be mounted in this exhibition wing.
          </p>
        </div>
      </Container>
    </div>
  );
};

export default ComparePage;
