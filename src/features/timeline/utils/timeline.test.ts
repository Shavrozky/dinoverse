import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dinosaurs, getDinosaurBySlug } from '@/data/dinosaurs';
import { geologicalPeriods } from '@/data/periods';
import { MESOZOIC_OLDEST_MYA, MESOZOIC_YOUNGEST_MYA } from '@/features/timeline/types/timeline';
import {
  clampMya,
  getDinosaursAliveAt,
  getPeriodAtMya,
  isDinosaurAliveAt,
  myaToTimelinePercent,
  sortSpeciesByFirstAppearance,
  timelinePercentToMya,
  toRangeSegment,
} from '@/features/timeline/utils/geologicalScale';
import {
  DEFAULT_TIMELINE_MYA,
  buildTimelineSearchParams,
  getRepresentedMidpointMya,
  parseTimelineSearchParams,
} from '@/features/timeline/utils/timelineUrl';
import { buildAxisTicks, getAxisTickInterval } from '@/features/timeline/utils/geologicalScale';
import { formatMyaValue } from '@/features/timeline/utils/timelineLabels';
import type { Dinosaur } from '@/types';

function dino(slug: string): Dinosaur {
  const found = getDinosaurBySlug(slug);
  assert.ok(found, `fixture "${slug}" must exist`);
  return found;
}

describe('MYA → percentage mapping', () => {
  it('puts the oldest boundary at 0% and the youngest at 100%', () => {
    assert.equal(myaToTimelinePercent(252), 0);
    assert.equal(myaToTimelinePercent(66), 100);
  });

  it('inverts direction: larger MYA maps further left', () => {
    const triassic = myaToTimelinePercent(220);
    const jurassic = myaToTimelinePercent(160);
    const cretaceous = myaToTimelinePercent(80);

    assert.ok(triassic < jurassic, 'Triassic must sit left of Jurassic');
    assert.ok(jurassic < cretaceous, 'Jurassic must sit left of Cretaceous');
  });

  it('maps the midpoint to 50%', () => {
    // Midpoint of 252–66 is 159.
    assert.equal(myaToTimelinePercent(159), 50);
  });

  it('is linear across the window', () => {
    assert.equal(myaToTimelinePercent(201), ((252 - 201) / 186) * 100);
    assert.equal(myaToTimelinePercent(145), ((252 - 145) / 186) * 100);
  });

  it('clamps values outside the Mesozoic', () => {
    assert.equal(myaToTimelinePercent(999), 0);
    assert.equal(myaToTimelinePercent(-50), 100);
  });
});

describe('percentage → MYA mapping', () => {
  it('is the exact inverse of the forward mapping', () => {
    for (const mya of [252, 230, 201, 175, 145, 100, 66]) {
      const percent = myaToTimelinePercent(mya);
      assert.ok(
        Math.abs(timelinePercentToMya(percent) - mya) < 1e-9,
        `round-trip failed at ${mya}`
      );
    }
  });

  it('maps 0% to the oldest and 100% to the youngest', () => {
    assert.equal(timelinePercentToMya(0), 252);
    assert.equal(timelinePercentToMya(100), 66);
  });

  it('clamps percentages outside 0–100', () => {
    assert.equal(timelinePercentToMya(-20), 252);
    assert.equal(timelinePercentToMya(140), 66);
  });

  it('degrades safely on non-finite input', () => {
    assert.equal(timelinePercentToMya(Number.NaN), 252);
  });
});

describe('period detection at boundaries', () => {
  // ICS convention: a boundary belongs to the base of the YOUNGER unit, so
  // 201 Mya is Jurassic and 145 Mya is Cretaceous. The canonical records are
  // written `startMya` (older) → `endMya` (younger), adjacent periods sharing
  // one value, which is exactly what that convention requires.
  it('identifies the period at the outer Mesozoic bounds', () => {
    assert.equal(getPeriodAtMya(252)?.id, 'triassic');
    assert.equal(getPeriodAtMya(66)?.id, 'cretaceous');
  });

  it('resolves interior boundaries to the younger period', () => {
    assert.equal(getPeriodAtMya(201)?.id, 'jurassic');
    assert.equal(getPeriodAtMya(145)?.id, 'cretaceous');
  });

  it('identifies periods just inside each boundary', () => {
    assert.equal(getPeriodAtMya(251)?.id, 'triassic');
    assert.equal(getPeriodAtMya(200)?.id, 'jurassic');
    assert.equal(getPeriodAtMya(144)?.id, 'cretaceous');
    assert.equal(getPeriodAtMya(67)?.id, 'cretaceous');
  });

  it('returns null outside the Mesozoic', () => {
    assert.equal(getPeriodAtMya(300), null);
    assert.equal(getPeriodAtMya(65), null);
    assert.equal(getPeriodAtMya(Number.NaN), null);
  });

  it('never leaves a gap: every whole Myr in range resolves to a period', () => {
    for (let mya = 252; mya >= 66; mya -= 1) {
      assert.ok(getPeriodAtMya(mya) !== null, `no period at ${mya} MYA`);
    }
  });

  it('agrees with the canonical period records', () => {
    for (const period of geologicalPeriods) {
      const midpoint = (period.startMya + period.endMya) / 2;
      assert.equal(getPeriodAtMya(midpoint)?.id, period.id);
    }
  });
});

describe('active-at-time', () => {
  it('includes a species inside its range', () => {
    const trex = dino('tyrannosaurus-rex'); // 68 → 66
    assert.equal(isDinosaurAliveAt(trex, 67), true);
  });

  it('includes both range boundaries', () => {
    const trex = dino('tyrannosaurus-rex');
    assert.equal(isDinosaurAliveAt(trex, 68), true, 'older bound is inclusive');
    assert.equal(isDinosaurAliveAt(trex, 66), true, 'younger bound is inclusive');
  });

  it('excludes times outside the range', () => {
    const trex = dino('tyrannosaurus-rex');
    assert.equal(isDinosaurAliveAt(trex, 69), false);
    assert.equal(isDinosaurAliveAt(trex, 65), false);
  });

  it('never treats a larger MYA as more recent', () => {
    // Stegosaurus lived 155–145. At 150 it is alive; at 100 it is long gone.
    const stegosaurus = dino('stegosaurus-stenops');
    assert.equal(isDinosaurAliveAt(stegosaurus, 150), true);
    assert.equal(isDinosaurAliveAt(stegosaurus, 100), false);
    assert.equal(isDinosaurAliveAt(stegosaurus, 200), false);
  });

  it('returns the expected set at representative moments', () => {
    const at67 = getDinosaursAliveAt(dinosaurs, 67).map((d) => d.slug);
    assert.ok(at67.includes('tyrannosaurus-rex'));
    assert.ok(at67.includes('triceratops-horridus'));
    assert.ok(at67.includes('ankylosaurus-magniventris'));
    // A Jurassic animal must not appear at the end of the Cretaceous.
    assert.ok(!at67.includes('stegosaurus-stenops'));

    const at150 = getDinosaursAliveAt(dinosaurs, 150).map((d) => d.slug);
    assert.ok(at150.includes('stegosaurus-stenops'));
    assert.ok(at150.includes('brachiosaurus-altithorax'));
    assert.ok(!at150.includes('tyrannosaurus-rex'));

    const at215 = getDinosaursAliveAt(dinosaurs, 215).map((d) => d.slug);
    assert.ok(at215.includes('coelophysis-bauri'));
    assert.ok(!at215.includes('tyrannosaurus-rex'));
  });

  it('can return an empty set without throwing', () => {
    assert.deepEqual(getDinosaursAliveAt([], 150), []);
    assert.deepEqual(getDinosaursAliveAt(dinosaurs, 65), []);
  });
});

describe('range segments', () => {
  it('gives a 2 Myr range a proportionally narrow bar', () => {
    const trex = dino('tyrannosaurus-rex'); // 68 → 66, 2 Myr
    const stegosaurus = dino('stegosaurus-stenops'); // 155 → 145, 10 Myr

    const trexSegment = toRangeSegment(trex);
    const stegoSegment = toRangeSegment(stegosaurus);

    assert.ok(
      trexSegment.widthPercent < stegoSegment.widthPercent,
      'a 2 Myr range must be narrower than a 10 Myr range'
    );
    assert.ok(Math.abs(trexSegment.widthPercent - (2 / 186) * 100) < 1e-9);
  });

  it('places the start at the OLDER bound', () => {
    const trex = dino('tyrannosaurus-rex');
    const segment = toRangeSegment(trex);
    assert.ok(Math.abs(segment.startPercent - ((252 - 68) / 186) * 100) < 1e-9);
  });

  it('never produces a negative width from inverted input', () => {
    for (const dinosaur of dinosaurs) {
      const segment = toRangeSegment(dinosaur);
      assert.ok(segment.widthPercent >= 0, `${dinosaur.slug} produced a negative width`);
      assert.ok(segment.startPercent >= 0 && segment.startPercent <= 100);
    }
  });

  it('keeps every range inside the 0–100 window', () => {
    for (const dinosaur of dinosaurs) {
      const segment = toRangeSegment(dinosaur);
      assert.ok(segment.startPercent + segment.widthPercent <= 100 + 1e-9);
    }
  });
});

describe('sorting', () => {
  it('orders by first appearance, oldest first', () => {
    const sorted = sortSpeciesByFirstAppearance(dinosaurs);
    for (let i = 1; i < sorted.length; i += 1) {
      const previous = sorted[i - 1] as Dinosaur;
      const current = sorted[i] as Dinosaur;
      assert.ok(
        previous.livedFromMya >= current.livedFromMya,
        `${previous.slug} should not precede ${current.slug}`
      );
    }
  });

  it('breaks ties by scientific name, deterministically', () => {
    const a: Dinosaur = { ...dino('tyrannosaurus-rex'), scientificName: 'Zeta rex' };
    const b: Dinosaur = { ...dino('tyrannosaurus-rex'), id: 'b', scientificName: 'Alpha rex' };
    const sorted = sortSpeciesByFirstAppearance([a, b]);
    assert.equal(sorted[0]?.scientificName, 'Alpha rex');
  });

  it('does not mutate the input array', () => {
    const input = [...dinosaurs];
    const copy = [...input];
    sortSpeciesByFirstAppearance(input);
    assert.deepEqual(
      input.map((d) => d.slug),
      copy.map((d) => d.slug)
    );
  });
});

describe('time clamping', () => {
  it('clamps into the Mesozoic window', () => {
    assert.equal(clampMya(999), 252);
    assert.equal(clampMya(0), 66);
    assert.equal(clampMya(150), 150);
  });

  it('falls back to the oldest bound on non-finite input', () => {
    assert.equal(clampMya(Number.NaN), 252);
    assert.equal(clampMya(Number.POSITIVE_INFINITY), 252);
  });
});

describe('axis ticks', () => {
  it('chooses readable intervals', () => {
    assert.equal(getAxisTickInterval(186), 25);
  });

  it('always labels both boundaries', () => {
    const ticks = buildAxisTicks(186);
    assert.equal(ticks[0], 252);
    assert.equal(ticks[ticks.length - 1], 66);
  });

  it('descends monotonically', () => {
    const ticks = buildAxisTicks(186);
    for (let i = 1; i < ticks.length; i += 1) {
      assert.ok((ticks[i] as number) < (ticks[i - 1] as number));
    }
  });
});

describe('URL parsing', () => {
  it('defaults to the youngest boundary with no params', () => {
    const parsed = parseTimelineSearchParams(new URLSearchParams(''));
    assert.equal(parsed.state.mya, DEFAULT_TIMELINE_MYA);
    assert.equal(parsed.state.period, null);
    assert.equal(parsed.hadInvalidTime, false);
  });

  it('parses a valid time', () => {
    const parsed = parseTimelineSearchParams(new URLSearchParams('time=150'));
    assert.equal(parsed.state.mya, 150);
    assert.equal(parsed.hadInvalidTime, false);
    assert.equal(parsed.wasClamped, false);
  });

  it('rejects a non-numeric time and flags it', () => {
    const parsed = parseTimelineSearchParams(new URLSearchParams('time=banana'));
    assert.equal(parsed.state.mya, DEFAULT_TIMELINE_MYA);
    assert.equal(parsed.hadInvalidTime, true);
  });

  it('clamps an out-of-range time and flags it', () => {
    const over = parseTimelineSearchParams(new URLSearchParams('time=999'));
    assert.equal(over.state.mya, 252);
    assert.equal(over.wasClamped, true);
    assert.equal(over.hadInvalidTime, false);

    const under = parseTimelineSearchParams(new URLSearchParams('time=10'));
    assert.equal(under.state.mya, 66);
    assert.equal(under.wasClamped, true);
  });

  it('accepts decimal times', () => {
    const parsed = parseTimelineSearchParams(new URLSearchParams('time=150.5'));
    assert.equal(parsed.state.mya, 150.5);
  });

  it('parses a valid period filter', () => {
    assert.equal(
      parseTimelineSearchParams(new URLSearchParams('period=jurassic')).state.period,
      'jurassic'
    );
  });

  it('ignores an invalid period filter', () => {
    assert.equal(
      parseTimelineSearchParams(new URLSearchParams('period=banana')).state.period,
      null
    );
    assert.equal(
      parseTimelineSearchParams(new URLSearchParams('period=TRIASSIC')).state.period,
      'triassic',
      'period matching should be case-insensitive'
    );
  });

  it('focuses the cursor on the period when a filter has no explicit time', () => {
    // Otherwise the listed rows could never be active and the inspector would
    // contradict the filter. The focus point must satisfy BOTH: it lies inside
    // the period, AND at least one of that period's specimens is alive there.
    for (const periodId of ['triassic', 'jurassic', 'cretaceous'] as const) {
      const parsed = parseTimelineSearchParams(new URLSearchParams(`period=${periodId}`));
      assert.equal(parsed.state.period, periodId);
      assert.equal(
        getPeriodAtMya(parsed.state.mya)?.id,
        periodId,
        `focus ${parsed.state.mya} is not inside ${periodId}`
      );

      const alive = getDinosaursAliveAt(dinosaurs, parsed.state.mya).filter(
        (dinosaur) => dinosaur.period === periodId
      );
      assert.ok(
        alive.length > 0,
        `no ${periodId} specimen is alive at the focus point ${parsed.state.mya}`
      );
    }
  });

  it('respects an explicit time even alongside a filter', () => {
    const parsed = parseTimelineSearchParams(new URLSearchParams('time=150&period=jurassic'));
    assert.equal(parsed.state.mya, 150);
    assert.equal(parsed.state.period, 'jurassic');
  });

  it('never throws on hostile input', () => {
    for (const query of ['time=%00', `time=${'9'.repeat(400)}`, 'time=&period=', '&&&']) {
      assert.doesNotThrow(() => parseTimelineSearchParams(new URLSearchParams(query)));
    }
  });
});

describe('URL serialisation', () => {
  it('emits nothing for the default state', () => {
    assert.equal(
      buildTimelineSearchParams({ mya: DEFAULT_TIMELINE_MYA, period: null }).toString(),
      ''
    );
  });

  it('emits the selected time', () => {
    const params = buildTimelineSearchParams({ mya: 150, period: null });
    assert.equal(params.get('time'), '150');
  });

  it('emits the period filter', () => {
    const params = buildTimelineSearchParams({ mya: 150, period: 'jurassic' });
    assert.equal(params.get('time'), '150');
    assert.equal(params.get('period'), 'jurassic');
  });

  it('rounds sub-100-kyr precision away', () => {
    const params = buildTimelineSearchParams({ mya: 150.04, period: null });
    assert.equal(params.get('time'), '150');
  });

  it('round-trips through the parser', () => {
    const params = buildTimelineSearchParams({ mya: 187.5, period: 'jurassic' });
    const reparsed = parseTimelineSearchParams(params);
    assert.equal(reparsed.state.mya, 187.5);
    assert.equal(reparsed.state.period, 'jurassic');
  });
});

describe('species navigation midpoint', () => {
  it('returns the represented midpoint, not a fabricated date', () => {
    const trex = dino('tyrannosaurus-rex'); // 68–66 → 67
    assert.equal(getRepresentedMidpointMya(trex), 67);
  });

  it('rounds to one decimal', () => {
    const spinosaurus = dino('spinosaurus-aegyptiacus'); // 99–93.5 → 96.25
    assert.equal(getRepresentedMidpointMya(spinosaurus), 96.3);
  });
});

describe('data integrity', () => {
  it('every record has an ordered range (older > younger)', () => {
    for (const dinosaur of dinosaurs) {
      assert.ok(
        dinosaur.livedFromMya > dinosaur.livedToMya,
        `${dinosaur.slug} has an inverted range`
      );
    }
  });

  it('every range falls inside the Mesozoic window', () => {
    for (const dinosaur of dinosaurs) {
      assert.ok(dinosaur.livedFromMya <= MESOZOIC_OLDEST_MYA, `${dinosaur.slug} starts too old`);
      assert.ok(dinosaur.livedToMya >= MESOZOIC_YOUNGEST_MYA, `${dinosaur.slug} ends too young`);
    }
  });

  it('every range lies within its declared period', () => {
    for (const dinosaur of dinosaurs) {
      const period = geologicalPeriods.find((entry) => entry.id === dinosaur.period);
      assert.ok(period, `${dinosaur.slug} has an unknown period`);
      assert.ok(
        dinosaur.livedFromMya <= period.startMya && dinosaur.livedToMya >= period.endMya,
        `${dinosaur.slug} extends outside ${period.id}`
      );
    }
  });

  it('validates boundary ranges (68–66 MYA and 155–150 MYA) and handles missing temporal data safely', () => {
    const trex = dino('tyrannosaurus-rex'); // 68–66 MYA
    const jurassicSample: Dinosaur = {
      ...dino('allosaurus-fragilis'),
      livedFromMya: 155,
      livedToMya: 150,
    };

    const trexSeg = toRangeSegment(trex);
    assert.ok(Math.abs(trexSeg.startPercent - ((252 - 68) / 186) * 100) < 1e-9);
    assert.ok(Math.abs(trexSeg.widthPercent - (2 / 186) * 100) < 1e-9);
    assert.ok(Math.abs(trexSeg.startPercent + trexSeg.widthPercent - 100) < 1e-9);

    const jurassicSeg = toRangeSegment(jurassicSample);
    assert.ok(Math.abs(jurassicSeg.startPercent - ((252 - 155) / 186) * 100) < 1e-9);
    assert.ok(Math.abs(jurassicSeg.widthPercent - (5 / 186) * 100) < 1e-9);

    const malformed: Dinosaur = {
      ...trex,
      livedFromMya: Number.NaN,
      livedToMya: Number.NaN,
    };
    assert.equal(isDinosaurAliveAt(malformed, 67), false);
    assert.deepEqual(toRangeSegment(malformed), { startPercent: 0, widthPercent: 0 });
  });

  it('formats MYA values consistently to at most one decimal place', () => {
    assert.equal(formatMyaValue(150), '150');
    assert.equal(formatMyaValue(68.4), '68.4');
    assert.equal(formatMyaValue(93.5), '93.5');
    assert.equal(formatMyaValue(66.04), '66');
  });
});
