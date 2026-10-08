/** How large numbers are written. */
export type Notation = 'scientific' | 'short' | 'engineering'

/** Suffixes for the short notation: thousand, million, billion, … */
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']

/** Three significant digits for a mantissa between 1 and 999 (99.96 → "100"). */
function mantissa(value: number): string {
  return value.toPrecision(3)
}

/**
 * Formats a number for display: plain integers below 1,000; above, three
 * significant digits in the chosen notation – scientific (1.23e6), short
 * (1.23M) or engineering (1.23e6, 12.3e6, 123e6).
 */
export function formatNumber(value: number, notation: Notation = 'scientific'): string {
  if (!Number.isFinite(value)) return value > 0 ? 'Infinity' : value < 0 ? '-Infinity' : 'NaN'
  const abs = Math.abs(value)
  if (abs < 1000) return Math.floor(value).toString()
  // Rounding can carry over (999.5e3 → 1.00e6), so derive the exponent from the rounded value.
  const exponent = Number(value.toExponential(2).split('e')[1])
  if (notation === 'scientific') return value.toExponential(2).replace('e+', 'e')
  const group = Math.floor(exponent / 3)
  const scaled = value / Math.pow(10, group * 3)
  if (notation === 'short' && group < SUFFIXES.length) return mantissa(scaled) + SUFFIXES[group]
  if (notation === 'short') return value.toExponential(2).replace('e+', 'e')
  return `${mantissa(scaled)}e${group * 3}`
}

/** Formats a cost: like `formatNumber`, but rounds up so the shown amount is enough. */
export function formatCost(value: number, notation: Notation = 'scientific'): string {
  return formatNumber(Math.abs(value) < 1000 ? Math.ceil(value - 1e-9) : value, notation)
}

/**
 * Formats a rate or other small fractional value: up to two decimals below
 * 10, one below 100, none below 1,000, the chosen notation above.
 */
export function formatRate(value: number, notation: Notation = 'scientific'): string {
  const abs = Math.abs(value)
  if (abs >= 1000) return formatNumber(value, notation)
  const decimals = abs < 10 ? 2 : abs < 100 ? 1 : 0
  return Number(value.toFixed(decimals)).toString()
}

/** Formats a duration in seconds as e.g. "2d 3h", "4h 12m", "5m 3s" or "42s". */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}
