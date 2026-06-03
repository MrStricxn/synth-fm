import TrackRow from '../TrackRow'
import './views.css'

function plural(n) {
  const a = n % 10, b = n % 100
  if (a === 1 && b !== 11) return 'трек'
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return 'трека'
  return 'треков'
}

export default function LikedView({ liked, currentTrack, onPlay, onLike }) {
  return (
    <div className="view">
      <div className="view__head">
        <h1 className="view__title view__title--grad">Мне нравится</h1>
        <span className="view__sub">{liked.length} {plural(liked.length)}</span>
      </div>

      {liked.length === 0 ? (
        <div className="view__empty">
          <div className="view__empty-emoji">♥</div>
          <div className="view__empty-text">Пока нет любимых треков. Нажми ♥ на любом треке.</div>
        </div>
      ) : (
        <div className="view__list">
          {liked.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              onPlay={t => onPlay(t, liked)}
              onLike={onLike}
              isLiked={true}
              isActive={currentTrack?.id === track.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
