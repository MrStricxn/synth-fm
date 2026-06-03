// hearthis.at API client — open, key-less, CORS-enabled (access-control-allow-
// origin: *). Returns full audio/mpeg streams, so it plays through the same
// native <audio> engine as Audius. Better CIS / Russian-rap coverage with more
// accurate titles than Audius.
import { colorFor } from './audius'

const BASE = 'https://api-v2.hearthis.at'

// Most uploads name the track "Artist - Title"; pull the real artist out of the
// title when possible, else fall back to the uploader's username.
function splitArtist(title, fallback) {
  const m = (title || '').split(' - ')
  if (m.length >= 2 && m[0].trim().length >= 2) {
    return { artist: m[0].trim(), title: m.slice(1).join(' - ').trim() }
  }
  return { artist: fallback || 'Unknown', title: (title || 'Untitled').trim() }
}

export function normalizeTrack(t) {
  const dur = Number(t.duration) || 0
  const { artist, title } = splitArtist(t.title, t.user?.username)
  return {
    id: `h_${t.id}`,
    title,
    artist,
    artwork: t.artwork_url || t.thumb || '',
    streamUrl: t.stream_url,
    duration: dur * 1000, // seconds → ms
    genre: (t.genre || '').toLowerCase(),
    playCount: Number(t.playback_count) || 0,
    color: colorFor(`h_${t.id}`),
    source: 'hearthis',
  }
}

// Keep songs, drop DJ-mixes / podcasts / broken entries.
function playable(t) {
  const dur = Number(t.duration) || 0
  return t.stream_url && dur >= 30 && dur <= 600
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`hearthis ${path} → ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function searchTracks(query, limit = 20) {
  const data = await get(`/search/?t=${encodeURIComponent(query)}&count=${limit}`)
  return data.filter(playable).map(normalizeTrack)
}

// Resolve several CIS search terms to a few tracks each, in parallel.
export async function resolveSeed(terms, perTerm = 3) {
  const results = await Promise.allSettled(terms.map(q => searchTracks(q, perTerm)))
  const seen = new Set()
  const out = []
  for (const r of results) {
    if (r.status !== 'fulfilled') continue
    for (const t of r.value) {
      if (seen.has(t.id)) continue
      seen.add(t.id)
      out.push(t)
    }
  }
  return out
}
