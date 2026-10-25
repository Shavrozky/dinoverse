import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';

export const NotFoundPage: FC = () => {
  useDocumentTitle('Specimen Not Cataloged — 404');

  return (
    <div style={{ padding: 'var(--space-24) 0' }}>
      <Container>
        <div
          style={{
            textAlign: 'center',
            maxWidth: '560px',
            margin: '0 auto',
            padding: 'var(--space-12) var(--space-8)',
            backgroundColor: 'var(--museum-surface)',
            border: '1px dashed var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <span
            style={{
              fontSize: '3.5rem',
              display: 'block',
              marginBottom: 'var(--space-4)',
              opacity: 0.6,
            }}
          >
            🦴
          </span>
          <span
            style={{
              fontFamily: 'var(--font-family-label)',
              fontSize: '0.75rem',
              letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--warm-brass)',
              display: 'block',
              marginBottom: 'var(--space-2)',
            }}
          >
            STRATIGRAPHIC VOID // 404
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-family-serif)',
              fontSize: 'var(--font-size-3xl)',
              color: 'var(--bone-white)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Extinct Path
          </h1>
          <p
            style={{
              color: 'var(--fossil-stone)',
              marginBottom: 'var(--space-8)',
              lineHeight: 1.7,
            }}
          >
            The requested archival path has eroded into prehistoric strata. No specimen records or
            exhibition halls correspond to this URL.
          </p>
          <Link to="/">
            <Button variant="primary">Return to Exhibition Base →</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default NotFoundPage;
