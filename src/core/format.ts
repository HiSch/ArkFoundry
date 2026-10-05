/**
 * Formats a number for display: plain integers below 1,000, scientific
 * notation with three significant digits above (e.g. 1.23e6).
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return value > 0 ? 'Infinity' : value < 0 ? '-Infinity' : 'NaN'
  const abs = Math.abs(value)
  if (abs < 1000) return Math.floor(value).toString()
  return value.toExponential(2).replace('e+', 'e')
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
