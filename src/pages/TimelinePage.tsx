import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui';
import { geologicalPeriods } from '@/data/periods';
import { useDocumentTitle } from '@/hooks';

export const TimelinePage: FC = () => {
  useDocumentTitle('Geological Timeline — Chronostratigraphy');

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
            Chronostratigraphic Record
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
            Geological Timeline
          </h1>
          <p style={{ color: 'var(--fossil-stone)', maxWidth: '640px', lineHeight: 1.7 }}>
            Travel through 186 million years of the Mesozoic Era. Stratigraphic layers record the
            emergence, diversification, and catastrophic terminus of non-avian dinosaurs.
          </p>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-8)',
          }}
        >
          {geologicalPeriods.map((period, index) => (
            <Link
              key={period.id}
              to={`/explore?period=${period.id}`}
              style={{
                backgroundColor: 'var(--museum-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                textDecoration: 'none',
                color: 'inherit',
                transition:
                  'border-color var(--transition-fast), background-color var(--transition-fast)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>0{index + 1} // ERA</span>
                <span
                  style={{
                    color: 'var(--warm-brass)',
                    fontFamily: 'var(--font-family-label)',
                    letterSpacing: 'var(--tracking-wider)',
                  }}
                >
                  {period.startMya}—{period.endMya} MYA
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-family-serif)',
                  fontSize: 'var(--font-size-2xl)',
                  color: 'var(--bone-white)',
                  margin: 'var(--space-2) 0',
                }}
              >
                {period.name} Period
              </h2>
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--fossil-stone)',
                  lineHeight: 1.65,
                }}
              >
                {period.description}
              </p>
              <span
                style={{
                  marginTop: 'auto',
                  paddingTop: 'var(--space-4)',
                  fontFamily: 'var(--font-family-label)',
                  fontSize: '0.75rem',
                  letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase',
                  color: 'var(--warm-brass)',
                }}
              >
                View {period.name} Specimens →
              </span>
            </Link>
          ))}
        </section>
      </Container>
    </div>
  );
};

export default TimelinePage;
