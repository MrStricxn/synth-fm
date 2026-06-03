import './NowPlaying.css'
import { useState, useRef } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'

function fmt(ms) {
  if (!ms && ms !== 0) return '--:--'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

function ratioFromEvent(el, clientX) {
  const r = el.getBoundingClientRect()
  if (r.width === 0) return 0
  return Math.max(0, Math.min(1, (clientX - r.left) / r.width))
}

const I = {
  prev: <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M7 6a1 1 0 0 1 2 0v5l8.4-5.6A1 1 0 0 1 19 6.2v11.6a1 1 0 0 1-1.6.8L9 13v5a1 1 0 0 1-2 0V6Z"/></svg>,
  next: <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M17 6a1 1 0 0 0-2 0v5L6.6 5.4A1 1 0 0 0 5 6.2v11.6a1 1 0 0 0 1.6.8L15 13v5a1 1 0 0 0 2 0V6Z"/></svg>,
  play: <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z"/></svg>,
  pause: <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.3"/><rect x="14" y="5" width="4" height="14" rx="1.3"/></svg>,
  close: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>,
  heart: (liked) => <svg viewBox="0 0 24 24" width="24" height="24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.3-9.2-8.5C1.3 8.3 2.8 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.2 0 4.7 3.3 3.2 6.5C19 15.7 12 20 12 20Z"/></svg>,
}

export default function NowPlaying() {
  const fullscreen  = usePlayerStore(s => s.fullscreen)
  const currentTrack = usePlayerStore(s => s.currentTrack)
  const isPlaying   = usePlayerStore(s => s.isPlaying)
  const progress    = usePlayerStore(s => s.progress)
  const duration    = usePlayerStore(s => s.duration)
  const liked       = usePlayerStore(s => s.liked)

  const seekRef = useRef(null)
  const [scrub, setScrub] = useState(null)

  if (!fullscreen || !currentTrack) return null

  const isLiked = liked.some(t => t.id === currentTrack.id)
  const livePct = duration > 0 ? (progress / duration) * 100 : 0
  const seekPct = scrub != null ? scrub * 100 : livePct
  const shownProgress = scrub != null ? scrub * duration : progress

  const store = usePlayerStore.getState()

  function startSeek(e) {
    if (!duration) return
    e.preventDefault()
    const apply = ev => setScrub(ratioFromEvent(seekRef.current, ev.clientX))
    apply(e)
    const move = ev => apply(ev)
    const up = ev => {
      const r = ratioFromEvent(seekRef.current, ev.clientX)
      store.setProgress(Math.floor(r * duration), duration)
      window.dispatchEvent(new CustomEvent('sc:seek', { detail: Math.floor(r * duration) }))
      setScrub(null)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className="now-playing">
      <button className="now-playing__close" aria-label="close" onClick={() => store.setFullscreen(false)}>{I.close}</button>

      <div className="now-playing__stage">
        <div className="now-playing__art">
          {currentTrack.artwork
            ? <img src={currentTrack.artwork} alt={currentTrack.title} />
            : <div className="now-playing__gradient" style={{ background: currentTrack.color }} />
          }
        </div>

        <div className="now-playing__meta">
          <div className="now-playing__title">{currentTrack.title}</div>
          <div className="now-playing__artist">{currentTrack.artist}</div>
        </div>

        <div className="now-playing__seek-row">
          <span className="now-playing__time">{fmt(shownProgress)}</span>
          <div
            ref={seekRef}
            className={`now-playing__seek${scrub != null ? ' scrubbing' : ''}`}
            onPointerDown={startSeek}
          >
            <div className="now-playing__seek-fill" style={{ width: `${seekPct}%` }} />
            <div className="now-playing__seek-thumb" style={{ left: `${seekPct}%` }} />
          </div>
          <span className="now-playing__time">{fmt(duration)}</span>
        </div>

        <div className="now-playing__controls">
          <button className="now-playing__btn" aria-label="prev" onClick={() => store.prevTrack()}>{I.prev}</button>
          <button className="now-playing__play" aria-label={isPlaying ? 'pause' : 'play'} onClick={() => store.togglePlay()}>
            {isPlaying ? I.pause : I.play}
          </button>
          <button className="now-playing__btn" aria-label="next" onClick={() => store.nextTrack()}>{I.next}</button>
          <button
            className="now-playing__like"
            data-liked={String(isLiked)}
            aria-label={isLiked ? 'unlike' : 'like'}
            onClick={() => store.toggleLike(currentTrack)}
          >{I.heart(isLiked)}</button>
        </div>
      </div>
    </div>
  )
}
