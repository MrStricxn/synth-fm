import TrackCard from '../TrackCard'
import TrackRow from '../TrackRow'
import './views.css'
import './LibraryView.css'

function plural(n) {
  const a = n % 10, b = n % 100
  if (a === 1 && b !== 11) return 'трек'
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return 'трека'
  return 'треков'
}

export default function LibraryView({ tracks, currentTrack, isPlaying, onPlay, onLike, isLiked }) {
  if (!tracks.length) {
    return (
      <div className="view">
        <div className="view__empty">
          <div className="view__empty-emoji">🔍</div>
          <div className="view__empty-text">Ничего не найдено</div>
        </div>
      </div>
    )
  }

  const gridTracks = tracks.slice(0, 8)

  return (
    <div className="view library-view">
      <div className="view__head">
        <h1 className="view__title">Коллекция</h1>
        <span className="view__sub">{tracks.length} {plural(tracks.length)}</span>
      </div>

      <div className="library-view__grid">
        {gridTracks.map(track => (
          <TrackCard
            key={track.id}
            track={track}
            onPlay={t => onPlay(t, tracks)}
            isPlaying={currentTrack?.id === track.id && isPlaying}
          />
        ))}
      </div>

      <div className="view__section">Все треки</div>
      <div className="view__list">
        {tracks.map((track, i) => (
          <TrackRow
            key={track.id}
            track={track}
            index={i}
            onPlay={t => onPlay(t, tracks)}
            onLike={onLike}
            isLiked={isLiked(track.id)}
            isActive={currentTrack?.id === track.id}
          />
        ))}
      </div>
    </div>
  )
}
