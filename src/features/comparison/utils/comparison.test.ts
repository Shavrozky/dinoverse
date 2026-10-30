import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getDinosaurBySlug } from '@/data/dinosaurs';
import {
  buildComparisonSearchParams,
  isFalsyFlag,
  parseComparisonSearchParams,
} from '@/features/comparison/utils/comparisonUrl';
import {
  buildRulerTicks,
  buildStagedSpecimens,
  calculateComparisonScale,
  getMeasurementInterval,
  getSilhouetteKind,
  roundUpToInterval,
} from '@/features/comparison/utils/comparisonScale';
import {
  formatRatio,
  getHeaviestSpecimen,
  getLargestSpecimen,
  getLengthRatio,
  getMassRatio,
  getSmallestSpecimen,
} from '@/features/comparison/utils/comparisonMetrics';
import {
  HUMAN_REFERENCE_HEIGHT_METERS,
  MAX_COMPARISON_SPECIMENS,
} from '@/features/comparison/types/comparison';
import type { Dinosaur } from '@/types';

/** Resolves a slug or throws — keeps the tests honest about fixture identity. */
function dino(slug: string): Dinosaur {
  const found = getDinosaurBySlug(slug);
  assert.ok(found, `fixture dinosaur "${slug}" must exist`);
  return found;
}

describe('comparison scale engine', () => {
  it('uses one identical pixels-per-metre for every specimen', () => {
    const specimens = [
      dino('tyrannosaurus-rex'),
      dino('velociraptor-mongoliensis'),
      dino('triceratops-horridus'),
    ];

    const scale = calculateComparisonScale({
      specimens,
      showHuman: true,
      availableWidth: 1200,
      availableHeight: 340,
    });

    assert.ok(scale.pixelsPerMeter > 0);

    // The defining property: rendered width is length × the SAME factor.
    const staged = buildStagedSpecimens(specimens, scale.pixelsPerMeter, true);
    for (const body of staged) {
      if (body.kind === 'human') {
        // Humans are drawn narrow on purpose; their HEIGHT is the real dimension.
        assert.equal(body.heightPx, HUMAN_REFERENCE_HEIGHT_METERS * scale.pixelsPerMeter);
      } else {
        assert.equal(body.widthPx, body.lengthMeters * scale.pixelsPerMeter);
      }
    }
  });

  it('preserves relative proportions between a 12.3 m and a 2 m animal', () => {
    const trex = dino('tyrannosaurus-rex');
    const raptor = dino('velociraptor-mongoliensis');

    const scale = calculateComparisonScale({
      specimens: [trex, raptor],
      availableWidth: 1200,
      availableHeight: 340,
    });
    const staged = buildStagedSpecimens([trex, raptor], scale.pixelsPerMeter, false);

    const trexBody = staged.find((body) => body.id === trex.id);
    const raptorBody = staged.find((body) => body.id === raptor.id);
    assert.ok(trexBody && raptorBody);

    const renderedRatio = trexBody.widthPx / raptorBody.widthPx;
    const realRatio = trex.lengthMeters / raptor.lengthMeters;
    assert.ok(
      Math.abs(renderedRatio - realRatio) < 1e-9,
      `rendered ratio ${renderedRatio} must equal real ratio ${realRatio}`
    );
  });

  it('supports very large specimens without hardcoding a T-Rex ceiling', () => {
    const argentino = dino('argentinosaurus-huinculensis');
    const scale = calculateComparisonScale({
      specimens: [argentino],
      availableWidth: 1200,
      availableHeight: 340,
    });

    assert.ok(scale.maxLengthMeters >= argentino.lengthMeters);
    assert.ok(scale.rulerMaxMeters >= argentino.lengthMeters);
    // A 33 m animal needs a coarser ruler than a 2 m one.
    assert.ok(scale.rulerIntervalMeters > 1);
  });

  it('lets the stage scroll rather than shrinking below readability', () => {
    const specimens = [dino('argentinosaurus-huinculensis'), dino('brachiosaurus-altithorax')];

    // A deliberately cramped viewport.
    const scale = calculateComparisonScale({
      specimens,
      availableWidth: 320,
      availableHeight: 340,
      minPixelsPerMeter: 14,
    });

    assert.ok(scale.pixelsPerMeter >= 14, 'must not shrink below the readability floor');
    assert.equal(scale.isScrollable, true, 'stage should scroll instead of shrinking');
    assert.ok(scale.stageWidthPx > 320);
  });

  it('does not mark a small comparison as scrollable on a wide stage', () => {
    const scale = calculateComparisonScale({
      specimens: [dino('velociraptor-mongoliensis'), dino('coelophysis-bauri')],
      availableWidth: 1400,
      availableHeight: 340,
    });
    assert.equal(scale.isScrollable, false);
  });

  it('includes the human reference in the height budget when enabled', () => {
    const tiny = dino('coelophysis-bauri'); // 1.0 m tall, shorter than a human

    const withoutHuman = calculateComparisonScale({
      specimens: [tiny],
      showHuman: false,
      availableWidth: 1200,
      availableHeight: 340,
    });
    const withHuman = calculateComparisonScale({
      specimens: [tiny],
      showHuman: true,
      availableWidth: 1200,
      availableHeight: 340,
    });

    assert.ok(withHuman.maxHeightMeters >= HUMAN_REFERENCE_HEIGHT_METERS);
    assert.ok(withHuman.maxHeightMeters > withoutHuman.maxHeightMeters);
  });

  it('places the human last, after dinosaurs ordered largest-first', () => {
    const specimens = [dino('velociraptor-mongoliensis'), dino('tyrannosaurus-rex')];
    const staged = buildStagedSpecimens(specimens, 30, true);

    assert.equal(staged[staged.length - 1]?.kind, 'human');
    // Largest dinosaur first.
    assert.equal(staged[0]?.id, specimens[1]?.id);
  });

  it('flags a dinosaur whose height is not documented, and keeps its length honest', () => {
    // Build a record with no heightMeters to exercise the documented/derived split.
    const synthetic: Dinosaur = {
      ...dino('tyrannosaurus-rex'),
      heightMeters: undefined,
    };

    const staged = buildStagedSpecimens([synthetic], 20, false);
    const body = staged[0];
    assert.ok(body);
    assert.equal(body.heightIsDocumented, false);
    assert.equal(body.heightMeters, null);
    // Drawing height falls back, but length stays canonical.
    assert.equal(body.widthPx, synthetic.lengthMeters * 20);
    assert.ok(body.heightPx > 0);
  });
});

describe('measurement ruler', () => {
  it('chooses human-readable intervals by magnitude', () => {
    assert.equal(getMeasurementInterval(2), 0.5);
    assert.equal(getMeasurementInterval(9), 1);
    assert.equal(getMeasurementInterval(25), 2);
    assert.equal(getMeasurementInterval(45), 5);
    assert.equal(getMeasurementInterval(100), 10);
    assert.equal(getMeasurementInterval(300), 20);
  });

  it('degrades safely on non-positive or non-finite input', () => {
    assert.equal(getMeasurementInterval(0), 1);
    assert.equal(getMeasurementInterval(-5), 1);
    assert.equal(getMeasurementInterval(Number.NaN), 1);
  });

  it('rounds the ruler extent up to a whole multiple of the interval', () => {
    assert.equal(roundUpToInterval(12.3, 1), 13);
    assert.equal(roundUpToInterval(33, 5), 35);
    assert.equal(roundUpToInterval(9, 2), 10);
  });

  it('emits ticks from zero to the rounded maximum inclusive', () => {
    const scale = calculateComparisonScale({
      specimens: [dino('argentinosaurus-huinculensis')],
      availableWidth: 1200,
      availableHeight: 340,
    });
    const ticks = buildRulerTicks(scale);

    assert.equal(ticks[0], 0);
    assert.ok(ticks[ticks.length - 1] !== undefined);
    assert.ok((ticks[ticks.length - 1] as number) >= 33);
    // Even spacing.
    for (let i = 1; i < ticks.length; i += 1) {
      const delta = (ticks[i] as number) - (ticks[i - 1] as number);
      assert.ok(Math.abs(delta - scale.rulerIntervalMeters) < 1e-9);
    }
  });
});

describe('comparison metrics', () => {
  const trex = dino('tyrannosaurus-rex');
  const raptor = dino('velociraptor-mongoliensis');

  it('computes the length ratio from canonical data', () => {
    const ratio = getLengthRatio(trex, raptor);
    assert.ok(ratio !== null);
    assert.ok(Math.abs(ratio - trex.lengthMeters / raptor.lengthMeters) < 1e-9);
    assert.ok(ratio > 6);
  });

  it('computes the mass ratio from canonical data', () => {
    const ratio = getMassRatio(trex, raptor);
    assert.ok(ratio !== null);
    assert.ok(ratio > 500, 'a T-Rex should be hundreds of times heavier than a Velociraptor');
  });

  it('returns null rather than a fabricated ratio when mass is undocumented', () => {
    const noMass: Dinosaur = { ...trex, weightKg: undefined };
    assert.equal(getMassRatio(noMass, raptor), null);
    assert.equal(getMassRatio(trex, { ...raptor, weightKg: undefined }), null);
  });

  it('returns null for zero or negative measurements', () => {
    assert.equal(getLengthRatio({ ...trex, lengthMeters: 0 }, raptor), null);
    assert.equal(getMassRatio({ ...trex, weightKg: 0 }, raptor), null);
  });

  it('finds the largest and smallest specimen by length', () => {
    const specimens = [raptor, trex, dino('triceratops-horridus')];
    assert.equal(getLargestSpecimen(specimens)?.id, trex.id);
    assert.equal(getSmallestSpecimen(specimens)?.id, raptor.id);
  });

  it('finds the heaviest specimen with a documented mass', () => {
    const specimens = [raptor, trex, dino('argentinosaurus-huinculensis')];
    assert.equal(getHeaviestSpecimen(specimens)?.slug, 'argentinosaurus-huinculensis');
  });

  it('returns null for empty input instead of throwing', () => {
    assert.equal(getLargestSpecimen([]), null);
    assert.equal(getSmallestSpecimen([]), null);
    assert.equal(getHeaviestSpecimen([]), null);
  });

  it('formats ratios without implying false precision', () => {
    assert.equal(formatRatio(6.15), '6.2');
    assert.equal(formatRatio(560), '560');
    assert.equal(formatRatio(Number.NaN), '—');
    assert.equal(formatRatio(0), '—');
  });
});

describe('URL parsing and validation', () => {
  it('resolves the documented default when no parameters are present', () => {
    const parsed = parseComparisonSearchParams(new URLSearchParams(''));

    assert.equal(parsed.hadNoSpecimenParams, true);
    assert.equal(parsed.state.specimens.length, 2);
    assert.equal(parsed.state.specimens[0]?.slug, 'tyrannosaurus-rex');
    assert.equal(parsed.state.specimens[1]?.slug, 'velociraptor-mongoliensis');
    assert.equal(parsed.state.showHuman, true);
    assert.equal(parsed.hadInvalidInput, false);
  });

  it('parses a valid a/b pair', () => {
    const parsed = parseComparisonSearchParams(
      new URLSearchParams('a=triceratops-horridus&b=stegosaurus-stenops')
    );

    assert.deepEqual(
      parsed.state.specimens.map((specimen) => specimen.slug),
      ['triceratops-horridus', 'stegosaurus-stenops']
    );
    assert.equal(parsed.hadInvalidInput, false);
  });

  it('parses three specimens', () => {
    const parsed = parseComparisonSearchParams(
      new URLSearchParams('a=tyrannosaurus-rex&b=velociraptor-mongoliensis&c=triceratops-horridus')
    );

    assert.equal(parsed.state.specimens.length, MAX_COMPARISON_SPECIMENS);
    assert.equal(parsed.state.hasThirdSlot, true);
  });

  it('never exceeds the maximum specimen count', () => {
    const parsed = parseComparisonSearchParams(
      new URLSearchParams(
        'a=tyrannosaurus-rex&b=velociraptor-mongoliensis&c=triceratops-horridus&d=stegosaurus-stenops'
      )
    );
    assert.ok(parsed.state.specimens.length <= MAX_COMPARISON_SPECIMENS);
  });

  it('drops an invalid slug and flags the input', () => {
    const parsed = parseComparisonSearchParams(
      new URLSearchParams('a=banana&b=velociraptor-mongoliensis')
    );

    assert.equal(parsed.hadInvalidInput, true);
    assert.ok(parsed.state.specimens.every((specimen) => specimen.slug !== 'banana'));
    assert.ok(parsed.state.specimens.length >= 1);
  });

  it('falls back to the default pair when every slug is invalid', () => {
    const parsed = parseComparisonSearchParams(new URLSearchParams('a=banana&b=also-not-real'));

    assert.equal(parsed.hadInvalidInput, true);
    assert.equal(parsed.state.specimens.length, 2);
    assert.equal(parsed.state.specimens[0]?.slug, 'tyrannosaurus-rex');
  });

  it('prevents the same dinosaur occupying two slots', () => {
    const parsed = parseComparisonSearchParams(
      new URLSearchParams('a=tyrannosaurus-rex&b=tyrannosaurus-rex')
    );

    assert.equal(parsed.hadInvalidInput, true);
    const slugs = parsed.state.specimens.map((specimen) => specimen.slug);
    assert.equal(slugs.filter((slug) => slug === 'tyrannosaurus-rex').length, 1);
  });

  it('treats an explicitly empty slot as cleared, not invalid', () => {
    const parsed = parseComparisonSearchParams(new URLSearchParams('a=tyrannosaurus-rex&b='));

    assert.equal(parsed.hadInvalidInput, false);
    assert.equal(parsed.state.specimens.length, 1);
  });

  it('honours human=0 and other falsy flags', () => {
    assert.equal(
      parseComparisonSearchParams(new URLSearchParams('human=0')).state.showHuman,
      false
    );
    assert.equal(
      parseComparisonSearchParams(new URLSearchParams('human=false')).state.showHuman,
      false
    );
    assert.equal(parseComparisonSearchParams(new URLSearchParams('human=1')).state.showHuman, true);
    assert.equal(parseComparisonSearchParams(new URLSearchParams('')).state.showHuman, true);
  });

  it('recognises falsy flag spellings', () => {
    for (const value of ['0', 'false', 'off', 'no', 'FALSE', ' 0 ']) {
      assert.equal(isFalsyFlag(value), true, `${value} should be falsy`);
    }
    for (const value of ['1', 'true', 'on', 'yes']) {
      assert.equal(isFalsyFlag(value), false, `${value} should not be falsy`);
    }
  });

  it('never throws on hostile input', () => {
    const hostile = [
      'a=%00',
      'a=' + 'x'.repeat(500),
      'a=TYRANNOSAURUS-REX',
      'a=tyrannosaurus-rex&a=triceratops-horridus',
      '&&&&',
      'a=../../../etc/passwd',
    ];

    for (const query of hostile) {
      assert.doesNotThrow(() => parseComparisonSearchParams(new URLSearchParams(query)));
    }
  });

  it('is case-insensitive on slugs', () => {
    const parsed = parseComparisonSearchParams(new URLSearchParams('a=TYRANNOSAURUS-REX'));
    assert.equal(parsed.state.specimens[0]?.slug, 'tyrannosaurus-rex');
  });
});

describe('URL serialisation', () => {
  it('emits nothing for the default comparison', () => {
    const specimens = [dino('tyrannosaurus-rex'), dino('velociraptor-mongoliensis')];
    const params = buildComparisonSearchParams(specimens, true);
    assert.equal(params.toString(), '');
  });

  it('emits every occupied slot when the comparison is not the default', () => {
    // Regression guard: a partial-elision implementation emitted only `?c=…`
    // and the parser then resolved a one-specimen comparison.
    const specimens = [
      dino('tyrannosaurus-rex'),
      dino('velociraptor-mongoliensis'),
      dino('triceratops-horridus'),
    ];
    const params = buildComparisonSearchParams(specimens, true);

    assert.equal(params.get('a'), 'tyrannosaurus-rex');
    assert.equal(params.get('b'), 'velociraptor-mongoliensis');
    assert.equal(params.get('c'), 'triceratops-horridus');
  });

  it('records only the human deviation when human is off', () => {
    const specimens = [dino('tyrannosaurus-rex'), dino('velociraptor-mongoliensis')];
    const params = buildComparisonSearchParams(specimens, false);

    assert.equal(params.get('human'), '0');
    assert.equal(params.get('a'), 'tyrannosaurus-rex');
  });

  it('round-trips through the parser without loss', () => {
    const original = [
      dino('brachiosaurus-altithorax'),
      dino('velociraptor-mongoliensis'),
      dino('stegosaurus-stenops'),
    ];
    const params = buildComparisonSearchParams(original, false);
    const reparsed = parseComparisonSearchParams(params);

    assert.deepEqual(
      reparsed.state.specimens.map((specimen) => specimen.slug),
      original.map((specimen) => specimen.slug)
    );
    assert.equal(reparsed.state.showHuman, false);
  });
});

describe('silhouette mapping', () => {
  it('maps known clades to a silhouette family', () => {
    assert.equal(getSilhouetteKind('Tyrannosauridae'), 'theropod');
    assert.equal(getSilhouetteKind('Brachiosauridae'), 'sauropod');
    assert.equal(getSilhouetteKind('Ceratopsidae'), 'ceratopsian');
    assert.equal(getSilhouetteKind('Stegosauridae'), 'stegosaur');
    assert.equal(getSilhouetteKind('Ankylosauridae'), 'ankylosaur');
  });

  it('falls back to a generic theropod profile for unknown clades', () => {
    // The fallback affects only the drawn SHAPE, never the scale.
    assert.equal(getSilhouetteKind('Unknownosauridae'), 'theropod');
    assert.equal(getSilhouetteKind(''), 'theropod');
  });
});
