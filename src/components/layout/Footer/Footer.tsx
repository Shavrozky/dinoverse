import type { FC } from 'react';
import { Container } from '@/components/ui';

export const Footer: FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--museum-charcoal)',
        padding: 'var(--space-12) 0 var(--space-8)',
        marginTop: 'auto',
      }}
    >
      <Container>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div style={{ maxWidth: '420px' }}>
            <span
              style={{
                fontFamily: 'var(--font-family-serif)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 700,
                letterSpacing: 'var(--tracking-wide)',
                color: 'var(--bone-white)',
                display: 'block',
                marginBottom: 'var(--space-1)',
              }}
            >
              DINOVERSE
            </span>
            <span
              style={{
                fontFamily: 'var(--font-family-label)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-widest)',
                color: 'var(--warm-brass)',
                display: 'block',
                marginBottom: 'var(--space-3)',
              }}
            >
              DIGITAL PALEONTOLOGY ARCHIVE & EXHIBITION
            </span>
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
              }}
            >
              Dedicated to the scientific exploration, 3D visualization, and chronological study of
              Mesozoic life from 252 to 66 million years ago.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--font-size-sm)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: 'var(--fossil-stone)',
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>CURATION</span>
            <span>20 Documented Specimens</span>
            <span>Triassic • Jurassic • Cretaceous</span>
            <span>Interactive 3D Viewport</span>
          </div>
        </div>

        <div
          style={{
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          <span>© {new Date().getFullYear()} DinoVerse Paleontology Archive</span>
          <span>EST. MESOZOIC ERA // CLASSIFIED RECORD</span>
        </div>
      </Container>
    </footer>
  );
};
