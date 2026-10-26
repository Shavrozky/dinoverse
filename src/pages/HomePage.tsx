import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from '@/components/ui';
import { ArchivalRule, Reveal } from '@/components/common';
import { getFeaturedDinosaurs } from '@/data/dinosaurs';
import { DinosaurCard, StaggeredCards } from '@/features/dinosaurs';
import { useDocumentTitle } from '@/hooks';
import { useTranslation } from '@/i18n';
import { MuseumHero } from './home/components/MuseumHero/MuseumHero';
import { FeaturedSpecimen } from './home/components/FeaturedSpecimen/FeaturedSpecimen';
import { EraOverview } from './home/components/EraOverview/EraOverview';
import styles from './HomePage.module.css';

const featuredDinosaurs = getFeaturedDinosaurs(3);

/**
 * 04 Curated Specimen Plates.
 *
 * The heading reveals as a group on scroll; the cards stagger in through the
 * shared `StaggeredCards` orchestrator, so the homepage grid and the archive
 * grid arrive with identical rhythm.
 */
const CuratedSpecimens: FC = () => {
  const { t } = useTranslation();

  return (
    <section
      style={{
        padding: 'var(--space-24) 0',
        borderBottom: '1px solid var(--border-subtle)',
      }}
      aria-labelledby="curated-specimens-heading"
    >
      <Container>
        <Reveal>
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
                {t.home.curatedSection.eyebrow}
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
                {t.home.curatedSection.title}
              </h2>
            </div>

            <Link to="/explore">
              <Button variant="secondary">{t.home.curatedSection.examineAllCta}</Button>
            </Link>
          </div>
        </Reveal>

        <StaggeredCards
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-8)',
          }}
          items={featuredDinosaurs.map((dinosaur, index) => ({
            id: dinosaur.id,
            node: <DinosaurCard dinosaur={dinosaur} specimenIndex={index + 1} />,
          }))}
        />
      </Container>
    </section>
  );
};

export const HomePage: FC = () => {
  const { t } = useTranslation();
  useDocumentTitle(t.home.documentTitle);

  return (
    <div>
      {/* 01 Immersive Exhibition Hero */}
      <MuseumHero />

      {/* 02 Exhibition Spotlight: Specimen 001 */}
      <FeaturedSpecimen />

      {/* 03 Mesozoic Eras Chronology */}
      <EraOverview />

      {/* 04 Curated Specimen Plates */}
      <CuratedSpecimens />

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
          <Reveal>
            <ArchivalRule className={styles.curatedRule} />
            <span
              style={{
                fontFamily: 'var(--font-family-label)',
                fontSize: '0.75rem',
                letterSpacing: 'var(--tracking-widest)',
                textTransform: 'uppercase',
                color: 'var(--warm-brass)',
                display: 'block',
                marginBottom: 'var(--space-3)',
                marginTop: 'var(--space-8)',
              }}
            >
              {t.home.inquirySection.eyebrow}
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
              {t.home.inquirySection.title}
            </h2>
            <p
              style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--fossil-stone)',
                lineHeight: 1.7,
                marginBottom: 'var(--space-8)',
              }}
            >
              {t.home.inquirySection.description}
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
                <Button variant="primary">{t.home.inquirySection.compareCta}</Button>
              </Link>
              <Link to="/timeline">
                <Button variant="outline">{t.home.inquirySection.timelineCta}</Button>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
