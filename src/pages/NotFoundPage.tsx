import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { useTranslation } from '@/i18n';

export const NotFoundPage: FC = () => {
  const { t } = useTranslation();
  useDocumentTitle(t.notFound.documentTitle);

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
            {t.notFound.badge}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-family-serif)',
              fontSize: 'var(--font-size-3xl)',
              color: 'var(--bone-white)',
              marginBottom: 'var(--space-3)',
            }}
          >
            {t.notFound.title}
          </h1>
          <p
            style={{
              color: 'var(--fossil-stone)',
              marginBottom: 'var(--space-8)',
              lineHeight: 1.7,
            }}
          >
            {t.notFound.description}
          </p>
          <Link to="/">
            <Button variant="primary">{t.notFound.returnBaseCta}</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default NotFoundPage;
