import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'
import './ParticleField.css'

// Brand colours (r,g,b) for the floating glow particles.
const COLORS = [
  [157, 78, 221],  // violet
  [224, 80, 159],  // magenta
  [255, 122, 89],  // coral
  [120, 180, 255], // cool accent for depth
]

// Pre-render a soft radial-glow sprite per colour once — drawing these is far
// cheaper than per-frame radial gradients or shadowBlur.
function makeSprite(rgb) {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`)
  grad.addColorStop(0.4, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.35)`)
  grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

export default function ParticleField() {
  const canvasRef = useRef(null)
  const playingRef = useRef(false)
  const pausedRef = useRef(false)
  const kickRef = useRef(null)
  const isPlaying = usePlayerStore(s => s.isPlaying)
  const fullscreen = usePlayerStore(s => s.fullscreen)

  useEffect(() => { playingRef.current = isPlaying }, [isPlaying])

  // Pause the whole animation loop while the fullscreen player is open — it's
  // hidden behind the overlay, and compositing it under a full-screen blur is
  // the most expensive thing on the page.
  useEffect(() => {
    pausedRef.current = fullscreen
    if (!fullscreen && kickRef.current) kickRef.current()
  }, [fullscreen])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return // e.g. jsdom / unsupported environment
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const sprites = COLORS.map(makeSprite)
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles = []
    let raf, running = true

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Scale particle count to viewport area, capped for performance.
      const target = Math.min(90, Math.round((w * h) / 22000))
      particles = Array.from({ length: target }, () => spawn(true))
    }

    function spawn(anywhere) {
      const big = Math.random() < 0.18
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 20,
        r: big ? 7 + Math.random() * 9 : 1.2 + Math.random() * 3,
        vy: (big ? 0.05 : 0.18) + Math.random() * 0.35,
        drift: 0.2 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: big ? 0.10 + Math.random() * 0.10 : 0.18 + Math.random() * 0.4,
        sprite: sprites[(Math.random() * sprites.length) | 0],
      }
    }

    function frame(t) {
      if (!running) return
      if (pausedRef.current) { raf = 0; return } // halted while fullscreen
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      const playing = playingRef.current
      const speed = playing ? 1.9 : 1
      const boost = playing ? 1.35 : 1

      for (const p of particles) {
        p.y -= p.vy * speed
        p.x += Math.sin(t / 1400 + p.phase) * p.drift * 0.35
        if (p.y < -30) Object.assign(p, spawn(false))

        const twinkle = 0.65 + 0.35 * Math.sin(t / 700 + p.phase)
        ctx.globalAlpha = Math.min(1, p.baseAlpha * twinkle * boost)
        const d = p.r * 10
        ctx.drawImage(p.sprite, p.x - d / 2, p.y - d / 2, d, d)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(frame)
    }

    // Allow the fullscreen effect to restart the loop after a pause.
    kickRef.current = () => { if (!raf && running && !reduce) raf = requestAnimationFrame(frame) }

    resize()
    window.addEventListener('resize', resize)

    if (reduce) {
      // Static, sparse frame — no animation loop.
      ctx.globalCompositeOperation = 'lighter'
      for (const p of particles) {
        ctx.globalAlpha = p.baseAlpha
        const d = p.r * 10
        ctx.drawImage(p.sprite, p.x - d / 2, p.y - d / 2, d, d)
      }
    } else {
      raf = requestAnimationFrame(frame)
    }

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />
}
