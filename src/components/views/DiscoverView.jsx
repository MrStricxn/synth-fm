import TrackCard from '../TrackCard'
import TrackRow from '../TrackRow'
import PlayActions from '../PlayActions'
import './views.css'

// Trending on Audius this week.
export default function DiscoverView({ tracks, loading, currentTrack, isPlaying, onPlay, onLike, isLiked }) {
  if (loading && !tracks.length) {
    return (
      <div className="view">
        <div className="view__head"><h1 className="view__title view__title--grad">Чарты</h1></div>
        <div className="view__loading">Загружаем тренды Audius…</div>
      </div>
    )
  }

  const grid = tracks.slice(0, 6)

  return (
    <div className="view">
      <div className="view__head">
        <h1 className="view__title view__title--grad">Чарты</h1>
        <span className="view__sub">Тренды Audius за неделю</span>
        <PlayActions tracks={tracks} />
      </div>

      <div className="library-view__grid">
        {grid.map(track => (
          <TrackCard key={track.id} track={track} onPlay={t => onPlay(t, tracks)}
            isPlaying={currentTrack?.id === track.id && isPlaying} />
        ))}
      </div>

      <div className="view__section">Весь чарт</div>
      <div className="view__list">
        {tracks.map((track, i) => (
          <TrackRow key={track.id} track={track} index={i} onPlay={t => onPlay(t, tracks)}
            onLike={onLike} isLiked={isLiked(track.id)} isActive={currentTrack?.id === track.id}
            duration={track.duration} />
        ))}
      </div>
    </div>
  )
}
