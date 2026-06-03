import './TrackCard.css'

export default function TrackCard({ track, onPlay, isPlaying = false }) {
  return (
    <button className={`track-card${isPlaying ? ' active' : ''}`} onClick={() => onPlay(track)}>
      <div className="track-card__art">
        {track.artwork
          ? <img src={track.artwork} alt={track.title} />
          : <div className="track-card__gradient" style={{ background: track.color }} />
        }
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
