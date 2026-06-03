import './PlayerBar.css'

function fmt(ms) {
  if (!ms && ms !== 0) return '--:--'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

const Icon = {
  shuffle: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h3.5l3 4M21 7h-4l-9 10H3M21 17h-4M18 4l3 3-3 3M18 14l3 3-3 3"/></svg>,
  prev: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 6a1 1 0 0 1 2 0v5l8.4-5.6A1 1 0 0 1 19 6.2v11.6a1 1 0 0 1-1.6.8L9 13v5a1 1 0 0 1-2 0V6Z"/></svg>,
  next: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17 6a1 1 0 0 0-2 0v5L6.6 5.4A1 1 0 0 0 5 6.2v11.6a1 1 0 0 0 1.6.8L15 13v5a1 1 0 0 0 2 0V6Z"/></svg>,
  play: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z"/></svg>,
  pause: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.3"/><rect x="14" y="5" width="4" height="14" rx="1.3"/></svg>,
  repeat: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2.5 20.5 6 17 9.5M3.5 11V9a3 3 0 0 1 3-3h14M7 21.5 3.5 18 7 14.5M20.5 13v2a3 3 0 0 1-3 3h-14"/></svg>,
  volume: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11 5 6.5 8.5H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h3.5L11 19a1 1 0 0 0 1.6-.8V5.8A1 1 0 0 0 11 5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  heart: (liked) => <svg viewBox="0 0 24 24" width="20" height="20" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.3-9.2-8.5C1.3 8.3 2.8 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.2 0 4.7 3.3 3.2 6.5C19 15.7 12 20 12 20Z"/></svg>,
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
        >{Icon.heart(isLiked)}</button>
      </div>

      <div className="player-bar__center">
        <div className="player-bar__controls">
          <button className={`player-bar__btn${shuffle ? ' active' : ''}`} aria-label="shuffle" onClick={onShuffle}>{Icon.shuffle}</button>
          <button className="player-bar__btn" aria-label="prev" onClick={onPrev}>{Icon.prev}</button>
          <button className="player-bar__play" aria-label={isPlaying ? 'pause' : 'play'} onClick={onTogglePlay}>
            {isPlaying ? Icon.pause : Icon.play}
          </button>
          <button className="player-bar__btn" aria-label="next" onClick={onNext}>{Icon.next}</button>
          <button className={`player-bar__btn${repeat !== 'none' ? ' active' : ''}`} aria-label="repeat" onClick={onRepeat}>
            {Icon.repeat}{repeat === 'one' && <span className="player-bar__repeat-one">1</span>}
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
        <span className="player-bar__vol-icon">{Icon.volume}</span>
        <div className="player-bar__vol-track" onClick={handleVolumeClick}>
          <div className="player-bar__vol-fill" style={{ width: `${volume}%` }} />
          <div className="player-bar__vol-thumb" style={{ left: `${volume}%` }} />
        </div>
      </div>
    </div>
  )
}
