import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from '@/components/ui';
import { getFeaturedDinosaurs } from '@/data/dinosaurs';
import { DinosaurCard } from '@/features/dinosaurs';
import { useDocumentTitle } from '@/hooks';
import { MuseumHero } from './home/components/MuseumHero/MuseumHero';
import { FeaturedSpecimen } from './home/components/FeaturedSpecimen/FeaturedSpecimen';
import { EraOverview } from './home/components/EraOverview/EraOverview';

const featuredDinosaurs = getFeaturedDinosaurs(3);

export const HomePage: FC = () => {
  useDocumentTitle('Digital Paleontology Archive');

  return (
    <div>
      {/* 01 Immersive Exhibition Hero */}
      <MuseumHero />

      {/* 02 Exhibition Spotlight: Specimen 001 */}
      <FeaturedSpecimen />

      {/* 03 Mesozoic Eras Chronology */}
      <EraOverview />

      {/* 04 Curated Specimen Plates */}
      <section
        style={{
          padding: 'var(--space-24) 0',
          borderBottom: '1px solid var(--border-subtle)',
        }}
        aria-labelledby="curated-specimens-heading"
      >
        <Container>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-6)',
              marginBottom: 'var(--space-12)',
            }}
          >
            <div>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-family-label)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-widest)',
                  color: 'var(--warm-brass)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Curated Holotypes
              </span>
              <h2
                id="curated-specimens-heading"
                style={{
                  fontFamily: 'var(--font-family-serif)',
                  fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                  fontWeight: 600,
                  color: 'var(--bone-white)',
                  lineHeight: 1.1,
                }}
              >
                Featured Specimens
              </h2>
            </div>

            <Link to="/explore">
              <Button variant="secondary">Examine Entire Archive (20 Species) →</Button>
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-8)',
            }}
          >
            {featuredDinosaurs.map((dinosaur, index) => (
              <DinosaurCard key={dinosaur.id} dinosaur={dinosaur} specimenIndex={index + 1} />
            ))}
          </div>
        </Container>
      </section>

      {/* 05 Scale & Comparative Inquiry Teaser */}
      <section
        style={{
          padding: 'var(--space-24) 0',
          backgroundColor: 'var(--museum-charcoal)',
          textAlign: 'center',
        }}
        aria-labelledby="archive-inquiry-heading"
      >
        <Container maxWidth="780px">
          <span
            style={{
              fontFamily: 'var(--font-family-label)',
              fontSize: '0.75rem',
              letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--warm-brass)',
              display: 'block',
              marginBottom: 'var(--space-3)',
            }}
          >
            RESEARCH & INQUIRY
          </span>
          <h2
            id="archive-inquiry-heading"
            style={{
              fontFamily: 'var(--font-family-serif)',
              fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
              color: 'var(--bone-white)',
              lineHeight: 1.15,
              marginBottom: 'var(--space-4)',
            }}
          >
            Comparative Paleontology & Morphometrics
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--fossil-stone)',
              lineHeight: 1.7,
              marginBottom: 'var(--space-8)',
            }}
          >
            Investigate evolutionary divergence, bodily proportions, and stratigraphy with our
            dedicated comparative scale tools and geological timeline explorer.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
            }}
          >
            <Link to="/compare">
              <Button variant="primary">Launch Scale Comparison →</Button>
            </Link>
            <Link to="/timeline">
              <Button variant="outline">Explore Stratigraphy</Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
