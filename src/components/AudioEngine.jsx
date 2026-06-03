import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'

// Playback engine backed by a native <audio> element streaming from Audius.
// Replaces the old SoundCloud iframe widget. Store progress/duration are kept
// in milliseconds (the UI already formats ms), while the audio element works in
// seconds — we convert at the boundary.
export default function AudioEngine() {
  const audioRef = useRef(null)
  const loadedUrlRef = useRef(null)

  const currentTrack = usePlayerStore(s => s.currentTrack)
  const isPlaying    = usePlayerStore(s => s.isPlaying)
  const volume       = usePlayerStore(s => s.volume)

  // Load + (maybe) play whenever the selected track changes.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack?.streamUrl) return
    if (loadedUrlRef.current === currentTrack.streamUrl) return
    loadedUrlRef.current = currentTrack.streamUrl
    audio.src = currentTrack.streamUrl
    audio.load()
    const { isPlaying: playing } = usePlayerStore.getState()
    if (playing) audio.play().catch(err => console.warn('autoplay blocked:', err))
  }, [currentTrack])

  // Sync play / pause.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    if (isPlaying) audio.play().catch(err => console.warn('play failed:', err))
    else audio.pause()
  }, [isPlaying, currentTrack])

  // Sync volume (0–100 → 0–1).
  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = Math.max(0, Math.min(1, volume / 100))
  }, [volume])

  // Wire up media events + seek requests once.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const store = () => usePlayerStore.getState()

    const onMeta = () => store().setDuration(Math.round(audio.duration * 1000))
    const onTime = () => store().setProgress(Math.round(audio.currentTime * 1000), Math.round((audio.duration || 0) * 1000))
    const onEnded = () => {
      const st = store()
      if (st.currentTrack) st.recordListen(st.currentTrack.id, true)
      const result = st.advanceAuto()
      if (result === 'repeat-one') {
        audio.currentTime = 0
        audio.play().catch(() => {})
      }
    }
    const onError = () => {
      // A dead/region-locked stream shouldn't freeze the queue — skip ahead.
      console.warn('stream error, skipping:', store().currentTrack?.title)
      store().nextTrack()
    }
    const onSeek = (e) => {
      if (Number.isFinite(e.detail)) audio.currentTime = e.detail / 1000
    }

    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    window.addEventListener('sc:seek', onSeek)
    return () => {
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      window.removeEventListener('sc:seek', onSeek)
    }
  }, [])

  return <audio ref={audioRef} preload="metadata" />
}
