import './PlayerBar.css'

function fmt(ms) {
  if (!ms && ms !== 0) return '--:--'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function PlayerBar({
  currentTrack, isPlaying, progress, duration, volume,
  isLiked, shuffle, repeat,
  onTogglePlay, onNext, onPrev, onSeek, onVolume, onLike, onShuffle, onRepeat,
}) {
  if (!currentTrack) return <div className="player-bar" />

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  function handleSeekClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    onSeek(Math.floor(ratio * duration))
  }

  function handleVolumeClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onVolume(Math.round(ratio * 100))
  }

  return (
    <div className="player-bar">
      <div className="player-bar__track">
        <div className="player-bar__art">
          {currentTrack.artwork
            ? <img src={currentTrack.artwork} alt={currentTrack.title} />
            : <div className="player-bar__gradient" style={{ background: currentTrack.color }} />
          }
        </div>
        <div className="player-bar__info">
          <div className="player-bar__title">{currentTrack.title}</div>
          <div className="player-bar__artist">{currentTrack.artist}</div>
        </div>
        <button
          className="player-bar__like"
          data-liked={String(isLiked)}
          aria-label={isLiked ? 'unlike' : 'like'}
          onClick={() => onLike(currentTrack)}
        >♥</button>
      </div>

      <div className="player-bar__center">
        <div className="player-bar__controls">
          <button className={`player-bar__btn${shuffle ? ' active' : ''}`} aria-label="shuffle" onClick={onShuffle}>⇄</button>
          <button className="player-bar__btn" aria-label="prev" onClick={onPrev}>⏮</button>
          <button className="player-bar__play" aria-label={isPlaying ? 'pause' : 'play'} onClick={onTogglePlay}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="player-bar__btn" aria-label="next" onClick={onNext}>⏭</button>
          <button className={`player-bar__btn${repeat !== 'none' ? ' active' : ''}`} aria-label="repeat" onClick={onRepeat}>
            {repeat === 'one' ? '↺¹' : '↺'}
          </button>
        </div>

        <div className="player-bar__progress">
          <span className="player-bar__time">{fmt(progress)}</span>
          <div className="player-bar__seek" onClick={handleSeekClick}>
            <div className="player-bar__seek-fill" style={{ width: `${pct}%` }} />
            <div className="player-bar__seek-thumb" style={{ left: `${pct}%` }} />
          </div>
          <span className="player-bar__time">{fmt(duration)}</span>
        </div>
      </div>

      <div className="player-bar__volume">
        <span className="player-bar__vol-icon">🔊</span>
        <div className="player-bar__vol-track" onClick={handleVolumeClick}>
          <div className="player-bar__vol-fill" style={{ width: `${volume}%` }} />
          <div className="player-bar__vol-thumb" style={{ left: `${volume}%` }} />
        </div>
      </div>
    </div>
  )
}
