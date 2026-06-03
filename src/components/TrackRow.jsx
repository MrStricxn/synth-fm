import './TrackRow.css'

function formatMs(ms) {
  if (!ms) return '--:--'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function TrackRow({ track, index, onPlay, onLike, isLiked, isActive = false, duration }) {
  return (
    <div className={`track-row${isActive ? ' active' : ''}`} onClick={() => onPlay(track)}>
      <span className="track-row__lead">
        {isActive ? (
          <span className="track-row__playing">▶</span>
        ) : (
          <>
            <span className="track-row__num">{String(index + 1).padStart(2, '0')}</span>
            <span className="track-row__hover-play" aria-hidden="true">▶</span>
          </>
        )}
      </span>
      <div className="track-row__art">
        {track.artwork
          ? <img src={track.artwork} alt={track.title} />
          : <div className="track-row__gradient" style={{ background: track.color }} />
        }
      </div>
      <div className="track-row__info">
        <div className="track-row__title">{track.title}</div>
        <div className="track-row__artist">{track.artist}</div>
      </div>
      <span className="track-row__duration">{formatMs(duration)}</span>
      <button
        className="track-row__like"
        data-liked={String(isLiked)}
        aria-label={isLiked ? 'unlike' : 'like'}
        onClick={e => { e.stopPropagation(); onLike(track) }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20s-7-4.3-9.2-8.5C1.3 8.3 2.8 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.2 0 4.7 3.3 3.2 6.5C19 15.7 12 20 12 20Z" />
        </svg>
      </button>
    </div>
  )
}
