// Yandex.Music client. The official API has no CORS and needs an OAuth token,
// so JSON calls go through a local origin-stripping proxy (see server/cors-proxy.cjs)
// with `Authorization: OAuth <token>`. The final MP3 is a signed storage URL
// played directly by the native <audio> engine (no token, no proxy) — see
// getStreamUrl / buildSignedUrl below.
import md5 from 'js-md5'
import { colorFor } from './colors'

const TOKEN = import.meta.env.VITE_YANDEX_TOKEN || ''
const PROXY = (import.meta.env.VITE_YANDEX_PROXY || 'http://localhost:8080').replace(/\/$/, '')
const API = 'https://api.music.yandex.net'

// avatars.yandex.net cover URIs end in `%%` — substitute a concrete size.
function coverUrl(uri, size = '400x400') {
  if (!uri) return ''
  return `https://${uri.replace('%%', size)}`
}

// Salt used by Yandex to sign direct-download URLs (stable, widely documented).
export const SIGN_SALT = 'XGRlBW9FXlekgbPrRHuSiA'

// Given the JSON download descriptor {host, path, ts, s}, compute the signed
// MP3 URL. md5 is injectable for testing; defaults to js-md5.
export function buildSignedUrl({ host, path, ts, s }, md5fn = md5) {
  const sign = md5fn(SIGN_SALT + path.replace(/^\//, '') + s)
  return `https://${host}/get-mp3/${sign}/${ts}${path}`
}

// Yandex track → the shape the rest of the app already expects. streamUrl is
// resolved lazily (getStreamUrl) because it costs an extra round-trip per track.
export function normalizeTrack(t) {
  const id = String(t.id)
  return {
    id: `ya_${id}`,
    trackId: id,
    title: t.title || 'Untitled',
    artist: t.artists?.[0]?.name || 'Unknown',
    artwork: coverUrl(t.coverUri),
    streamUrl: '',
    duration: t.durationMs || 0, // already ms
    genre: '',
    playCount: 0,
    color: colorFor(`ya_${id}`),
    source: 'yandex',
  }
}

// All JSON requests go through the CORS proxy with the OAuth header. Contract:
// `${PROXY}?url=<encodeURIComponent(target)>`.
async function apiGet(endpoint) {
  const res = await fetch(`${PROXY}?url=${encodeURIComponent(`${API}${endpoint}`)}`, {
    headers: { Authorization: `OAuth ${TOKEN}`, 'X-Requested-With': 'XMLHttpRequest' },
  })
  if (res.status === 401) throw new Error('Yandex 401 — токен протух/не задан (VITE_YANDEX_TOKEN)')
  if (!res.ok) throw new Error(`Yandex ${endpoint} → ${res.status}`)
  const json = await res.json()
  return json.result
}

// Resolve a track id to a playable MP3 URL (two round-trips + signature).
export async function getStreamUrl(trackId) {
  const variants = await apiGet(`/tracks/${trackId}/download-info`)
  const mp3s = (variants || []).filter(v => v.codec === 'mp3')
  if (!mp3s.length) throw new Error(`no mp3 variant for track ${trackId}`)
  mp3s.sort((a, b) => (b.bitrateInKbps || 0) - (a.bitrateInKbps || 0))
  // downloadInfoUrl returns XML by default; &format=json gives {host,path,ts,s}.
  const res = await fetch(`${PROXY}?url=${encodeURIComponent(`${mp3s[0].downloadInfoUrl}&format=json`)}`, {
    headers: { Authorization: `OAuth ${TOKEN}`, 'X-Requested-With': 'XMLHttpRequest' },
  })
  if (!res.ok) throw new Error(`Yandex download-info → ${res.status}`)
  const info = await res.json()
  return buildSignedUrl(info)
}

export async function searchTracks(query, limit = 20) {
  const result = await apiGet(`/search?text=${encodeURIComponent(query)}&type=track&page=0&nocorrect=false`)
  const items = result?.tracks?.results || []
  return items.slice(0, limit).map(normalizeTrack)
}

// Chart feed. result.chart.tracks is an array of chart items, each wrapping a
// track under `.track` (older payloads put the track inline) — handle both.
export async function trendingTracks(limit = 40) {
  const result = await apiGet('/landing3/chart')
  const items = result?.chart?.tracks || result?.tracks || []
  return items.map(x => normalizeTrack(x.track || x)).slice(0, limit)
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

// Resolve seed artist names to a few tracks each (deduped), like the other sources.
export async function resolveSeed(terms, perTerm = 2) {
  const results = await mapLimit(terms, 5, q => searchTracks(q, perTerm))
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
