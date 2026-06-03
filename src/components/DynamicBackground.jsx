import { useEffect } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'

function hexToRgbStr(hex) {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

function setVars(c1, c2) {
  const root = document.documentElement
  root.style.setProperty('--dyn-1', c1)
  root.style.setProperty('--dyn-2', c2)
}

// Pull two representative colours out of a 24x24 downscale of the artwork:
// an overall average and the most vivid pixel. Falls back to the track's
// gradient colours if the image is unreadable (CORS taint, load error).
function extractFromImage(img) {
  const size = 24
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  if (!g) return null
  g.drawImage(img, 0, 0, size, size)
  const { data } = g.getImageData(0, 0, size, size)

  let r = 0, gg = 0, b = 0, n = 0
  let vivid = null, vividScore = -1
  for (let i = 0; i < data.length; i += 4) {
    const R = data[i], G = data[i + 1], B = data[i + 2], A = data[i + 3]
    if (A < 128) continue
    r += R; gg += G; b += B; n++
    const max = Math.max(R, G, B), min = Math.min(R, G, B)
    const sat = max === 0 ? 0 : (max - min) / max
    const score = sat * max
    if (score > vividScore) { vividScore = score; vivid = [R, G, B] }
  }
  if (!n) return null
  const avg = [Math.round(r / n), Math.round(gg / n), Math.round(b / n)]
  const v = vivid || avg
  return [`${v[0]},${v[1]},${v[2]}`, `${avg[0]},${avg[1]},${avg[2]}`]
}

export default function DynamicBackground() {
  const currentTrack = usePlayerStore(s => s.currentTrack)

  useEffect(() => {
    if (!currentTrack) return
    let cancelled = false

    const hexes = (currentTrack.color || '').match(/#([0-9a-f]{6})/gi) || []
    const fb1 = hexes[0] ? hexToRgbStr(hexes[0]) : '157,78,221'
    const fb2 = hexes[1] ? hexToRgbStr(hexes[1]) : '224,80,159'

    if (!currentTrack.artwork) {
      setVars(fb1, fb2)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      let colors = null
      try { colors = extractFromImage(img) } catch { colors = null }
      colors ? setVars(colors[0], colors[1]) : setVars(fb1, fb2)
    }
    img.onerror = () => { if (!cancelled) setVars(fb1, fb2) }
    img.src = currentTrack.artwork

    return () => { cancelled = true }
  }, [currentTrack])

  return null
}
