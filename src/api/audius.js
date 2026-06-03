// Audius API client — open, key-less, CORS-enabled (access-control-allow-origin: *).
// Docs: https://docs.audius.org/api
//
// Two things make Audius a great fit here:
//   1. The JSON API can be called directly from the browser (no proxy/key).
//   2. /v1/tracks/{id}/stream returns a real audio/mpeg stream, so playback is a
//      plain HTML5 <audio> element — no SoundCloud iframe needed.

const APP = 'SYNTHFM'

// api.audius.co is the documented gateway and resolves /v1 directly. We keep a
// couple of known discovery hosts as fallbacks in case the gateway is flaky.
const HOSTS = [
  'https://api.audius.co',
  'https://discoveryprovider2.audius.co',
  'https://discoveryprovider3.audius.co',
]
let activeHost = HOSTS[0]

export function streamUrl(id) {
  return `${activeHost}/v1/tracks/${id}/stream?app_name=${APP}`
}

// Deterministic neon gradient per track id — used as artwork fallback and to
// drive the dynamic background when a track has no cover art.
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

// Audius track → the shape the rest of the app already expects.
export function normalizeTrack(t) {
  const art = t.artwork || {}
  return {
    id: t.id,
    title: t.title || 'Untitled',
    artist: t.user?.name || t.user?.handle || 'Unknown',
    artwork: art['480x480'] || art['150x150'] || art['1000x1000'] || '',
    streamUrl: streamUrl(t.id),
    duration: Math.round((t.duration || 0) * 1000), // seconds → ms (store uses ms)
    genre: (t.genre || '').toLowerCase(),
    playCount: t.play_count || 0,
    color: colorFor(t.id),
    source: 'audius',
  }
}

async function get(path, params = {}) {
  const qs = new URLSearchParams({ app_name: APP, ...params }).toString()
  let lastErr
  for (let i = 0; i < HOSTS.length; i++) {
    const host = i === 0 ? activeHost : HOSTS[i]
    try {
      const res = await fetch(`${host}${path}?${qs}`)
      if (!res.ok) throw new Error(`Audius ${path} → ${res.status}`)
      const json = await res.json()
      activeHost = host // remember the host that worked
      return json.data
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr || new Error('Audius request failed')
}

export async function searchTracks(query, limit = 20) {
  const data = await get('/v1/tracks/search', { query, limit, only_downloadable: false })
  return (data || []).map(normalizeTrack)
}

// genre is optional (e.g. 'Hip-Hop/Rap', 'Electronic'); time is week|month|year|allTime.
export async function trendingTracks({ genre, time = 'week', limit = 25 } = {}) {
  const params = { time, limit }
  if (genre) params.genre = genre
  const data = await get('/v1/tracks/trending', params)
  return (data || []).map(normalizeTrack)
}

export async function getTrack(id) {
  const data = await get(`/v1/tracks/${id}`)
  return data ? normalizeTrack(data) : null
}

// Run async fn over items with limited concurrency.
async function mapLimit(items, limit, fn) {
  const out = []
  let i = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++
      try { out[idx] = await fn(items[idx]) } catch { out[idx] = [] }
    }
  })
  await Promise.all(workers)
  return out
}

// Resolve a list of search terms (artist names) to a few tracks each, with
// limited concurrency. Failed/empty searches are skipped.
export async function resolveSeed(terms, perTerm = 1) {
  const results = await mapLimit(terms, 6, q => searchTracks(q, perTerm))
  const seen = new Set()
  const out = []
  for (const list of results) {
    for (const t of (list || [])) {
      if (seen.has(t.id)) continue
      seen.add(t.id)
      out.push(t)
    }
  }
  return out
}

export const AUDIUS_GENRES = [
  'Hip-Hop/Rap', 'Trap', 'Electronic', 'Lo-Fi', 'House',
  'Drum & Bass', 'Techno', 'Ambient', 'R&B/Soul', 'Pop',
]
