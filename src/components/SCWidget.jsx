import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'

export default function SCWidget() {
  const iframeRef = useRef(null)
  const widgetRef = useRef(null)
  const readyRef = useRef(false)

  const currentTrack = usePlayerStore(s => s.currentTrack)
  const isPlaying    = usePlayerStore(s => s.isPlaying)
  const volume       = usePlayerStore(s => s.volume)

  useEffect(() => {
    if (!iframeRef.current || !window.SC) return
    const widget = window.SC.Widget(iframeRef.current)
    widgetRef.current = widget
    const Events = window.SC.Widget.Events

    widget.bind(Events.READY, () => { readyRef.current = true })

    widget.bind(Events.PLAY_PROGRESS, ({ currentPosition, duration }) => {
      usePlayerStore.getState().setProgress(currentPosition, duration)
    })

    widget.bind(Events.FINISH, () => {
      usePlayerStore.getState().nextTrack()
    })
  }, [])

  useEffect(() => {
    if (!widgetRef.current || !readyRef.current || !currentTrack) return
    widgetRef.current.load(currentTrack.url, { auto_play: isPlaying })
  }, [currentTrack])

  useEffect(() => {
    if (!widgetRef.current || !readyRef.current || !currentTrack) return
    if (isPlaying) {
      widgetRef.current.play()
    } else {
      widgetRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (!widgetRef.current || !readyRef.current) return
    widgetRef.current.setVolume(volume)
  }, [volume])

  useEffect(() => {
    function onSeek(e) {
      if (widgetRef.current && readyRef.current) {
        widgetRef.current.seekTo(e.detail)
      }
    }
    window.addEventListener('sc:seek', onSeek)
    return () => window.removeEventListener('sc:seek', onSeek)
  }, [])

  const initialSrc = 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/kavinsky/nightcall&color=%23bc13fe&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false'

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
