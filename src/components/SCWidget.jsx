import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'
import { LIBRARY } from '../data/library'

export default function SCWidget() {
  const iframeRef = useRef(null)
  const widgetRef = useRef(null)
  const readyRef = useRef(false)

  const currentTrack = usePlayerStore(s => s.currentTrack)
  const isPlaying    = usePlayerStore(s => s.isPlaying)
  const volume       = usePlayerStore(s => s.volume)

  // Initialize the SoundCloud widget once. The SC API script may not be ready
  // at mount time (or may be blocked entirely), so we poll briefly for it and
  // wrap everything so a player failure can never crash the whole app.
  useEffect(() => {
    let cancelled = false
    let pollId

    function init() {
      try {
        if (cancelled || !iframeRef.current || !window.SC?.Widget) return false
        const widget = window.SC.Widget(iframeRef.current)
        widgetRef.current = widget
        const Events = window.SC.Widget.Events

        widget.bind(Events.READY, () => { readyRef.current = true })
        widget.bind(Events.PLAY_PROGRESS, (e) => {
          if (e) usePlayerStore.getState().setProgress(e.currentPosition, e.duration)
        })
        widget.bind(Events.FINISH, () => {
          usePlayerStore.getState().nextTrack()
        })
        return true
      } catch (err) {
        console.error('SCWidget init failed:', err)
        return false
      }
    }

    if (!init()) {
      // Poll for the SC API up to ~5s in case the external script loads late.
      let attempts = 0
      pollId = setInterval(() => {
        attempts += 1
        if (init() || attempts > 50) clearInterval(pollId)
      }, 100)
    }

    return () => {
      cancelled = true
      if (pollId) clearInterval(pollId)
    }
  }, [])

  useEffect(() => {
    try {
      if (!widgetRef.current || !readyRef.current || !currentTrack) return
      widgetRef.current.load(currentTrack.url, { auto_play: isPlaying })
    } catch (err) {
      console.error('SCWidget load failed:', err)
    }
  }, [currentTrack])

  useEffect(() => {
    try {
      if (!widgetRef.current || !readyRef.current || !currentTrack) return
      if (isPlaying) {
        widgetRef.current.play()
      } else {
        widgetRef.current.pause()
      }
    } catch (err) {
      console.error('SCWidget play/pause failed:', err)
    }
  }, [isPlaying])

  useEffect(() => {
    try {
      if (!widgetRef.current || !readyRef.current) return
      widgetRef.current.setVolume(volume)
    } catch (err) {
      console.error('SCWidget setVolume failed:', err)
    }
  }, [volume])

  useEffect(() => {
    function onSeek(e) {
      try {
        if (widgetRef.current && readyRef.current) {
          widgetRef.current.seekTo(e.detail)
        }
      } catch (err) {
        console.error('SCWidget seek failed:', err)
      }
    }
    window.addEventListener('sc:seek', onSeek)
    return () => window.removeEventListener('sc:seek', onSeek)
  }, [])

  const initialSrc = `https://w.soundcloud.com/player/?url=${encodeURIComponent(LIBRARY[0].url)}&color=%239d4edd&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`

  return (
    <iframe
      ref={iframeRef}
      src={initialSrc}
      style={{ display: 'none' }}
      allow="autoplay"
      title="SoundCloud Player"
    />
  )
}
