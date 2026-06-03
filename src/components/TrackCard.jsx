import './TrackCard.css'

export default function TrackCard({ track, onPlay, isPlaying = false }) {
  function handleMove(e) {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
    el.style.setProperty('--rx', `${(0.5 - py) * 7}deg`)
    el.style.setProperty('--ry', `${(px - 0.5) * 7}deg`)
  }
  function handleLeave(e) {
    const el = e.currentTarget
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <button
      className={`track-card${isPlaying ? ' active' : ''}`}
      onClick={() => onPlay(track)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="track-card__art">
        {track.artwork
          ? <img src={track.artwork} alt={track.title} />
          : <div className="track-card__gradient" style={{ background: track.color }} />
        }
        <span className="track-card__spotlight" aria-hidden="true" />
        <span className="track-card__play" aria-hidden="true">▶</span>
        {isPlaying && (
          <span className="track-card__eq" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
        )}
      </div>
      <div className="track-card__title">{track.title}</div>
      <div className="track-card__artist">{track.artist}</div>
    </button>
  )
}
