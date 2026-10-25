import type { FC } from 'react';
import { Container } from '@/components/ui';
import {
  DinosaurEmptyState,
  DinosaurFilters,
  DinosaurGrid,
  DinosaurResultCount,
  DinosaurSearch,
  DinosaurSort,
  useDinosaurCatalog,
} from '@/features/dinosaurs';
import { useDocumentTitle } from '@/hooks';
import styles from './ExplorePage.module.css';

export const ExplorePage: FC = () => {
  useDocumentTitle('Explore Dinosaurs');

  const {
    filteredDinosaurs,
    filters,
    hasActiveFilters,
    resultCount,
    availablePeriods,
    availableDiets,
    setSearch,
    setPeriod,
    setDiet,
    setSort,
    clearFilters,
  } = useDinosaurCatalog();

  return (
    <div className={styles.page}>
      <Container>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Mesozoic Specimen Archive</span>
          <h1 className={styles.title}>Dinosaur Encyclopedia</h1>
          <p className={styles.subtitle}>
            Discover prehistoric species from across the Mesozoic Era. Search by taxonomy, filter by
            geological period and diet, or inspect detailed anatomical profiles.
          </p>
        </header>

        <section className={styles.controlsPanel} aria-label="Catalog search and filters">
          <DinosaurSearch value={filters.search} onChange={setSearch} />

          <div className={styles.filterSortRow}>
            <DinosaurFilters
              selectedPeriod={filters.period}
              selectedDiet={filters.diet}
              availablePeriods={availablePeriods}
              availableDiets={availableDiets}
              onPeriodChange={setPeriod}
              onDietChange={setDiet}
            />

            <DinosaurSort value={filters.sort} onChange={setSort} />
          </div>
        </section>

        <DinosaurResultCount
          count={resultCount}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onRemoveSearch={() => setSearch('')}
          onRemovePeriod={() => setPeriod('all')}
          onRemoveDiet={() => setDiet('all')}
          onClearAll={clearFilters}
        />

        <section className={styles.catalogSection} aria-label="Dinosaur catalog results">
          {resultCount > 0 ? (
            <DinosaurGrid dinosaurs={filteredDinosaurs} />
          ) : (
            <DinosaurEmptyState onClearFilters={clearFilters} />
          )}
        </section>
      </Container>
    </div>
  );
};

export default ExplorePage;
