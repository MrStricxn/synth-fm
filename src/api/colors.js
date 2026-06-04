// Deterministic neon gradient per id — artwork fallback + dynamic background.
// Lives here (not in a source-specific client) so any source can reuse it.
const PALETTE = [
  ['#9d4edd', '#e0509f'], ['#ff512f', '#dd2476'], ['#1a2980', '#26d0ce'],
  ['#654ea3', '#eaafc8'], ['#11998e', '#38ef7d'], ['#0f2027', '#2c5364'],
  ['#41295a', '#2f0743'], ['#3a1c71', '#d76d77'], ['#f7971e', '#ffd200'],
  ['#5f2c82', '#49a09d'],
]

export function colorFor(id = '') {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const [a, b] = PALETTE[h % PALETTE.length]
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`
}
