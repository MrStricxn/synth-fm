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
      <span className={`track-row__index${isActive ? ' playing' : ''}`}>
        {isActive ? '▶' : String(index + 1).padStart(2, '0')}
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
      >♥</button>
    </div>
  )
}
