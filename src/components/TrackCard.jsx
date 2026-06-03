import './TrackCard.css'

export default function TrackCard({ track, onPlay, isPlaying = false, accentColor = 'var(--accent-purple)' }) {
  return (
    <button className={`track-card${isPlaying ? ' active' : ''}`} onClick={() => onPlay(track)}>
      <div className="track-card__art">
        {track.artwork
          ? <img src={track.artwork} alt={track.title} />
          : <div className="track-card__gradient" style={{ background: track.color }} />
        }
        {isPlaying && <div className="track-card__play-indicator">▶</div>}
      </div>
      <div className="track-card__title">{track.title}</div>
      <div className="track-card__artist" style={{ color: accentColor }}>{track.artist}</div>
    </button>
  )
}
