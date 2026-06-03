import './PlayActions.css'
import { usePlayerStore } from '../store/usePlayerStore'

// Header actions for any list of tracks: play the whole list in order, or
// shuffle it. Self-contained — talks to the store directly so view components
// don't need extra props threaded through.
export default function PlayActions({ tracks = [] }) {
  if (!tracks.length) return null

  const playAll = (shuffleStart) => usePlayerStore.getState().playAll(tracks, shuffleStart)

  return (
    <div className="play-actions">
      <button className="play-actions__main" onClick={() => playAll(false)} aria-label="play all">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z"/></svg>
        Слушать
      </button>
      <button className="play-actions__shuffle" onClick={() => playAll(true)} aria-label="shuffle all">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h3.5l3 4M21 7h-4l-9 10H3M21 17h-4M18 4l3 3-3 3M18 14l3 3-3 3"/></svg>
        Перемешать
      </button>
    </div>
  )
}
