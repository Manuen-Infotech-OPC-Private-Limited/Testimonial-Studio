/** Shared type definitions. */

/** One sampled colour as [r, g, b], each 0-255. */
export type RGB = [number, number, number];

/**
 * Measured data for the top-left gold ribbon.
 *
 * The ribbon is described row by row (y = 0 .. n.length-1, in design pixels):
 *   - n[y]  x of the navy-corner / gold boundary
 *   - g[y]  x of the gold / pale-halo boundary
 *   - h[y]  x of the halo / sky boundary
 * and by a cross-section colour profile sampled every `ks` rows:
 *   prof[k] holds `j1` colours across the gold band followed by `j2` colours across the halo.
 */
export interface TopLeftRibbon {
  readonly n: readonly number[];
  readonly g: readonly number[];
  readonly h: readonly number[];
  readonly ks: number;
  readonly j1: number;
  readonly j2: number;
  readonly prof: readonly (readonly RGB[])[];
}
