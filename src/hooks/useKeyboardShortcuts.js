import { useEffect } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'

function seekTo(ms, duration) {
  usePlayerStore.getState().setProgress(ms, duration)
  window.dispatchEvent(new CustomEvent('sc:seek', { detail: ms }))
}

// Global keyboard controls. Ignored while typing in inputs.
export function useKeyboardShortcuts() {
  useEffect(() => {
    function onKey(e) {
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return

      const s = usePlayerStore.getState()
      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault()
          if (s.currentTrack) s.togglePlay()
          break
        case 'ArrowRight':
          e.preventDefault()
          seekTo(Math.min(s.duration || 0, s.progress + 5000), s.duration)
          break
        case 'ArrowLeft':
          e.preventDefault()
          seekTo(Math.max(0, s.progress - 5000), s.duration)
          break
        case 'ArrowUp':
          e.preventDefault()
          s.setVolume(Math.min(100, s.volume + 5))
          break
        case 'ArrowDown':
          e.preventDefault()
          s.setVolume(Math.max(0, s.volume - 5))
          break
        case 'm': case 'M': case 'ь': case 'Ь':
          s.toggleMute()
          break
        case 'f': case 'F': case 'а': case 'А':
          if (s.currentTrack) s.toggleFullscreen()
          break
        case 'n': case 'N': case 'т': case 'Т':
          s.nextTrack()
          break
        case 'p': case 'P': case 'з': case 'З':
          s.prevTrack()
          break
        case 'Escape':
          if (s.fullscreen) s.setFullscreen(false)
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
