import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'
import { getStreamUrl } from '../api/yandex'

// Playback engine backed by a native <audio> element streaming from Yandex.Music.
// Store progress/duration are kept
// in milliseconds (the UI already formats ms), while the audio element works in
// seconds — we convert at the boundary.
export default function AudioEngine() {
  const audioRef = useRef(null)
  const loadedUrlRef = useRef(null)

  const currentTrack = usePlayerStore(s => s.currentTrack)
  const isPlaying    = usePlayerStore(s => s.isPlaying)
  const volume       = usePlayerStore(s => s.volume)

  // Load + (maybe) play whenever the selected track changes. Yandex tracks have
  // no streamUrl yet — resolve the signed MP3 URL on demand here.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    let cancelled = false
    ;(async () => {
      let url = currentTrack.streamUrl
      if (!url && currentTrack.source === 'yandex' && currentTrack.trackId) {
        try {
          url = await getStreamUrl(currentTrack.trackId)
        } catch (err) {
          console.warn('yandex stream resolve failed, skipping:', err)
          usePlayerStore.getState().nextTrack()
          return
        }
      }
      if (cancelled || !url) return
      if (loadedUrlRef.current === url) return
      loadedUrlRef.current = url
      audio.src = url
      audio.load()
      if (usePlayerStore.getState().isPlaying) {
        audio.play().catch(err => console.warn('autoplay blocked:', err))
      }
    })()
    return () => { cancelled = true }
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

  // Media Session API: lock-screen / notification controls + keeps audio alive
  // when the browser is backgrounded on mobile.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    if (currentTrack) {
      try {
        ms.metadata = new window.MediaMetadata({
          title: currentTrack.title || '',
          artist: currentTrack.artist || '',
          album: 'SYNTH.FM',
          artwork: currentTrack.artwork
            ? [96, 192, 512].map(s => ({ src: currentTrack.artwork, sizes: `${s}x${s}`, type: 'image/jpeg' }))
            : [],
        })
      } catch { /* MediaMetadata unsupported */ }
    }
    const st = () => usePlayerStore.getState()
    const set = (action, fn) => { try { ms.setActionHandler(action, fn) } catch { /* unsupported action */ } }
    set('play', () => st().togglePlay())
    set('pause', () => st().togglePlay())
    set('nexttrack', () => st().nextTrack())
    set('previoustrack', () => st().prevTrack())
    set('seekto', (e) => {
      if (e.seekTime != null && audioRef.current) {
        audioRef.current.currentTime = e.seekTime
        st().setProgress(Math.round(e.seekTime * 1000), st().duration)
      }
    })
  }, [currentTrack])

  // Reflect play state on the lock screen.
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    }
  }, [isPlaying])

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
