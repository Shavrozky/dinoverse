import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  dinosaurs,
  getDinosaurBySlug,
  getFeaturedDinosaurs,
  getRelatedDinosaurs,
} from '@/data/dinosaurs';
import {
  filterDinosaurs,
  formatLength,
  formatMillionsOfYears,
  formatResultCount,
  formatWeight,
  normalizeSearchTerm,
  parseDinosaurFiltersFromSearchParams,
  searchDinosaurs,
  sortDinosaurs,
} from '@/features/dinosaurs/utils';
import {
  isDinosaurDiet,
  isDinosaurSortOption,
  isGeologicalPeriod,
} from '@/features/dinosaurs/types';
import {
  calculateCameraFraming,
  calculateNormalizedTransform,
  resolveAnimationActions,
} from '@/three/utils/modelBounds';

describe('Dinosaur dataset integrity', () => {
  it('contains at least 15 representative dinosaurs with unique IDs and slugs', () => {
    assert.ok(dinosaurs.length >= 15, `Expected >= 15 dinosaurs, got ${dinosaurs.length}`);

    const ids = new Set<string>();
    const slugs = new Set<string>();

    for (const dino of dinosaurs) {
      assert.ok(!ids.has(dino.id), `Duplicate id: ${dino.id}`);
      assert.ok(!slugs.has(dino.slug), `Duplicate slug: ${dino.slug}`);
      ids.add(dino.id);
      slugs.add(dino.slug);

      assert.ok(isGeologicalPeriod(dino.period), `Invalid period for ${dino.slug}`);
      assert.ok(isDinosaurDiet(dino.diet), `Invalid diet for ${dino.slug}`);
      assert.ok(dino.livedFromMya >= dino.livedToMya, `Invalid age range for ${dino.slug}`);
      assert.ok(dino.lengthMeters > 0, `Invalid length for ${dino.slug}`);
    }
  });
});

describe('searchDinosaurs & normalizeSearchTerm', () => {
  it('normalizes whitespace and case', () => {
    assert.equal(normalizeSearchTerm('  Tyrannosaurus   REX  '), 'tyrannosaurus rex');
  });

  it('matches "rex" to Tyrannosaurus rex', () => {
    const results = searchDinosaurs(dinosaurs, 'rex');
    assert.ok(results.some((d) => d.slug === 'tyrannosaurus-rex'));
  });

  it('matches compact alias "trex" to Tyrannosaurus rex', () => {
    const results = searchDinosaurs(dinosaurs, 'trex');
    assert.ok(results.some((d) => d.slug === 'tyrannosaurus-rex'));
  });
});

describe('filterDinosaurs', () => {
  it('filters by cretaceous period only', () => {
    const results = filterDinosaurs(dinosaurs, { period: 'cretaceous' });
    assert.ok(results.length > 0);
    assert.ok(results.every((d) => d.period === 'cretaceous'));
  });

  it('filters by herbivore diet with no carnivores', () => {
    const results = filterDinosaurs(dinosaurs, { diet: 'herbivore' });
    assert.ok(results.length > 0);
    assert.ok(results.every((d) => d.diet === 'herbivore'));
    assert.ok(!results.some((d) => d.diet === 'carnivore'));
  });

  it('combines cretaceous period + carnivore diet + search query', () => {
    const results = filterDinosaurs(dinosaurs, {
      period: 'cretaceous',
      diet: 'carnivore',
      search: 'rex',
    });
    assert.equal(results.length, 1);
    assert.equal(results[0]?.slug, 'tyrannosaurus-rex');
  });
});

describe('sortDinosaurs', () => {
  it('sorts by name-asc and name-desc without mutating source array', () => {
    const copy = [...dinosaurs];
    const asc = sortDinosaurs(dinosaurs, 'name-asc');
    const desc = sortDinosaurs(dinosaurs, 'name-desc');

    assert.deepEqual(dinosaurs, copy);
    assert.equal(asc[0]?.name, 'Allosaurus');
    assert.equal(desc[0]?.name, 'Velociraptor');
  });

  it('sorts by largest and smallest length', () => {
    const largest = sortDinosaurs(dinosaurs, 'largest');
    const smallest = sortDinosaurs(dinosaurs, 'smallest');

    assert.equal(largest[0]?.slug, 'argentinosaurus-huinculensis');
    assert.equal(smallest[0]?.slug, 'velociraptor-mongoliensis');
  });

  it('sorts by oldest and youngest geological age', () => {
    const oldest = sortDinosaurs(dinosaurs, 'oldest');
    const youngest = sortDinosaurs(dinosaurs, 'youngest');

    assert.equal(oldest[0]?.period, 'triassic');
    assert.equal(youngest[0]?.livedToMya, 66);
  });
});

describe('URL query parameter validation', () => {
  it('gracefully falls back on invalid query parameters (?diet=banana&period=invalid)', () => {
    const params = new URLSearchParams('q=spino&diet=banana&period=invalid&sort=random');
    const parsed = parseDinosaurFiltersFromSearchParams(params);

    assert.equal(parsed.search, 'spino');
    assert.equal(parsed.diet, 'all');
    assert.equal(parsed.period, 'all');
    assert.equal(parsed.sort, 'name-asc');
    assert.equal(isDinosaurSortOption('random'), false);
  });
});

describe('Data access & related dinosaurs', () => {
  it('resolves dinosaur by slug and handles unknown slug', () => {
    const trex = getDinosaurBySlug('tyrannosaurus-rex');
    assert.ok(trex);
    assert.equal(trex.name, 'Tyrannosaurus rex');
    assert.equal(getDinosaurBySlug('not-a-real-dinosaur'), undefined);
  });

  it('returns 3 related dinosaurs excluding the target specimen', () => {
    const trex = getDinosaurBySlug('tyrannosaurus-rex');
    assert.ok(trex);
    const related = getRelatedDinosaurs(trex, 3);
    assert.equal(related.length, 3);
    assert.ok(related.every((d) => d.slug !== trex.slug));
  });

  it('returns featured dinosaurs', () => {
    const featured = getFeaturedDinosaurs(3);
    assert.equal(featured.length, 3);
    assert.ok(featured.every((d) => d.featured));
  });
});

describe('Formatting utilities', () => {
  it('formats length, weight, millions of years, and result counts accurately', () => {
    assert.equal(formatLength(12.3), '12.3 m');
    assert.equal(formatLength(9), '9 m');
    assert.equal(formatWeight(8500), '8.5 tonnes');
    assert.equal(formatWeight(1000), '1 tonne');
    assert.equal(formatWeight(75), '75 kg');
    assert.equal(formatMillionsOfYears(68, 66), '68–66 million years ago');
    assert.equal(formatResultCount(1), '1 dinosaur');
    assert.equal(formatResultCount(20), '20 dinosaurs');
  });
});

describe('Phase 3 3D Specimen Utilities', () => {
  it('normalizes model bounds uniformly and grounds lowest Y to 0', () => {
    const transform = calculateNormalizedTransform(
      {
        min: [-1, -2, -5],
        max: [1, 2, 5],
        size: [2, 4, 10],
        center: [0, 0, 0],
        maxDimension: 10,
      },
      3.8
    );

    assert.equal(Number(transform.scale.toFixed(2)), 0.38);
    // Grounding: -min.y * scale = 2 * 0.38 = 0.76
    assert.equal(Number(transform.position[1].toFixed(2)), 0.76);
    assert.equal(transform.position[0], 0);
    assert.equal(transform.position[2], 0);
  });

  it('computes adaptive camera framing with valid distance bounds', () => {
    const framing = calculateCameraFraming([0.6, 1.35, 3.8], 40, 1.45);
    assert.ok(framing.minDistance > 0);
    assert.ok(framing.maxDistance > framing.minDistance);
    assert.ok(framing.target[1] > 0);
  });

  it('resolves and orders animation clips into IDLE, WALK, ROAR actions', () => {
    const actions = resolveAnimationActions(['Roar', 'Walk', 'Idle']);
    assert.deepEqual(
      actions.map((a) => a.label),
      ['IDLE', 'WALK', 'ROAR']
    );
    assert.deepEqual(resolveAnimationActions([]), []);
  });
});
