import type { FC } from 'react';
import type { SilhouetteKind } from '../../types/comparison';

export interface SpecimenSilhouetteProps {
  kind: SilhouetteKind;
  /** Rendered width in px (already scaled by pixels-per-metre). */
  widthPx: number;
  /** Rendered height in px (already scaled by pixels-per-metre). */
  heightPx: number;
  /** Fill colour, supplied by CSS so themes stay in one place. */
  color?: string;
  className?: string;
}

/**
 * Abstract taxonomic silhouettes, drawn on a 100 × 100 viewBox and stretched to
 * the caller's true-scale box.
 *
 * IMPORTANT — these are deliberately schematic body plans, not palaeoart:
 * DinoVerse holds no per-species silhouette assets, so each shape communicates
 * gross proportions (neck length, tail, stance, bulk) without pretending to be
 * an anatomically precise reconstruction. Because every body is drawn into a
 * box derived from its real length × a shared pixels-per-metre, the *size*
 * comparison is exact even where the outline is generic.
 *
 * Each path is authored so the lowest point sits on y = 100 (the ground line),
 * which lets the stage align all bodies on one baseline.
 */
const PATHS: Record<SilhouetteKind, string> = {
  // Bipedal predator: deep skull, counterbalancing tail, strong hind limbs.
  theropod: `
    M6 74 C14 70 22 68 30 67
    L34 58 C40 56 46 58 50 62
    L58 52 C62 44 68 38 76 34
    C84 30 92 32 96 38
    C99 43 97 50 92 52
    L84 53 C82 58 78 62 72 64
    L70 74 C72 82 70 90 66 96
    L58 96 C60 88 60 80 58 74
    L50 76 C48 84 44 92 40 96
    L32 96 C36 86 38 78 38 72
    C32 72 26 74 20 78
    C14 82 8 80 6 74 Z
  `,
  // Sauropod: long neck, small head, barrel body, long tail.
  sauropod: `
    M2 78 C10 74 18 72 26 72
    L40 46 C46 34 54 26 62 22
    C70 18 78 20 82 26
    C85 31 83 37 78 39
    L70 39 C68 46 64 54 60 60
    L58 76 C60 84 58 92 54 98
    L44 98 C46 90 46 82 44 76
    L36 76 C34 84 32 92 28 98
    L20 98 C24 88 26 80 26 72
    C18 74 10 78 4 84
    Z
  `,
  // Ceratopsian: heavy low body, frill and horns at the front.
  ceratopsian: `
    M8 82 C16 76 24 74 32 74
    L36 62 C42 56 50 54 58 56
    L64 44 C70 38 78 36 84 40
    C90 44 92 52 88 58
    L80 60 C80 68 78 74 74 78
    L72 88 C74 94 72 98 68 100
    L58 100 C60 94 60 88 58 82
    L46 82 C44 88 42 94 38 100
    L28 100 C32 92 34 86 34 80
    C24 84 14 86 8 82 Z
  `,
  // Stegosaur: arched back with plates, small head, tail spikes.
  stegosaur: `
    M4 82 C12 78 20 76 28 76
    L32 66 C40 62 48 62 56 66
    L60 56 C66 50 72 46 78 44
    L82 52 C86 54 88 60 86 66
    L80 68 C80 76 78 82 74 86
    L72 92 C74 96 72 100 68 100
    L58 100 C60 94 60 88 58 84
    L46 84 C44 90 42 96 38 100
    L28 100 C32 92 34 86 34 80
    C24 84 14 86 8 84 Z
  `,
  // Ankylosaur: very low, wide armoured body with tail club.
  ankylosaur: `
    M4 88 C12 82 22 80 32 80
    L36 72 C44 68 54 68 62 72
    L68 64 C74 60 82 60 88 64
    C92 68 92 76 88 80
    L82 82 C82 88 80 92 76 96
    L66 96 C68 92 68 88 66 84
    L52 84 C50 90 48 94 44 98
    L34 98 C38 92 40 88 40 82
    C28 86 14 90 6 90 Z
  `,
  // Hadrosaur: duck-billed, semi-bipedal, deep tail.
  hadrosaur: `
    M4 80 C14 76 24 74 32 74
    L36 62 C42 58 50 58 56 62
    L62 50 C68 42 76 38 84 40
    C90 42 92 50 88 56
    L80 58 C78 66 74 72 68 76
    L66 86 C68 92 66 97 62 100
    L52 100 C54 94 54 88 52 82
    L42 82 C40 88 38 94 34 100
    L24 100 C28 92 30 86 30 78
    C20 82 12 84 6 82 Z
  `,
  // Ornithomimid: slender, long-legged, small head, long neck.
  ornithomimid: `
    M8 70 C18 66 26 64 34 64
    L38 50 C42 42 48 36 54 30
    C60 24 68 22 74 26
    C78 29 78 34 74 36
    L66 36 C62 42 58 50 54 56
    L52 70 C54 80 52 90 46 100
    L38 100 C42 90 44 80 42 70
    L36 70 C32 80 28 90 22 100
    L14 100 C20 88 22 78 20 68
    C16 70 12 74 8 78 Z
  `,
  // Human reference silhouette, standing upright on the baseline.
  human: `
    M38 12 C38 5 62 5 62 12
    C62 19 55 24 50 24
    C45 24 38 19 38 12 Z
    M34 28 C40 24 60 24 66 28
    C70 34 70 44 68 52
    L64 52 C66 44 65 38 63 34
    L62 58 C64 72 63 84 61 100
    L54 100 C55 84 55 72 53 60
    L47 60 C45 72 45 84 46 100
    L38 100 C37 84 37 72 39 58
    L38 34 C36 38 35 44 36 52
    L32 52 C30 44 30 34 34 28 Z
  `,
};

/**
 * Renders one specimen silhouette at its true-scale pixel box.
 *
 * `preserveAspectRatio="none"` is correct here: the box is already the honest
 * length × height product, so stretching the 100×100 viewBox into it preserves
 * relative scale rather than distorting it.
 */
export const SpecimenSilhouette: FC<SpecimenSilhouetteProps> = ({
  kind,
  widthPx,
  heightPx,
  color = 'currentColor',
  className,
}) => {
  return (
    <svg
      className={className}
      width={Math.max(1, widthPx)}
      height={Math.max(1, heightPx)}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill={color}
      role="presentation"
      focusable="false"
      aria-hidden="true"
    >
      <path d={PATHS[kind]} />
    </svg>
  );
};
