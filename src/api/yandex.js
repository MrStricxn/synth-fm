// Yandex.Music client. The official API has no CORS and needs an OAuth token,
// so JSON calls go through a local cors-anywhere proxy (see server/cors-proxy.cjs)
// with `Authorization: OAuth <token>`. The final MP3 is a signed storage URL
// played directly by the native <audio> engine (no token, no proxy) — see
// getStreamUrl / buildSignedUrl below.
import { colorFor } from './audius'

const TOKEN = import.meta.env.VITE_YANDEX_TOKEN || ''
const PROXY = (import.meta.env.VITE_YANDEX_PROXY || 'http://localhost:8080').replace(/\/$/, '')
const API = 'https://api.music.yandex.net'

// avatars.yandex.net cover URIs end in `%%` — substitute a concrete size.
function coverUrl(uri, size = '400x400') {
  if (!uri) return ''
  return `https://${uri.replace('%%', size)}`
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
