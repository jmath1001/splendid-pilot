// ─── Time slots — 24hr, 30-min intervals, 3pm–8pm ────────────────────────────
// Full 30-min granularity — used for availability matching and booking
export const TIME_SLOTS = [
  '15:00', '15:30',
  '16:00', '16:30',
  '17:00', '17:30',
  '18:00', '18:30',
  '19:00', '19:30',
  '20:00', '20:30'
]

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const MAX_CAPACITY = 2

/** Display a 24hr time string as 12hr e.g. '14:30' → '2:30 PM' */
export function formatTime(t: string): string {
  const [hStr, mStr] = t.split(':')
  const h = parseInt(hStr, 10)
  const m = mStr ?? '00'
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m} ${ampm}`
}