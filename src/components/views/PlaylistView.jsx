import TrackRow from '../TrackRow'
import './views.css'

function plural(n) {
  const a = n % 10, b = n % 100
  if (a === 1 && b !== 11) return 'трек'
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return 'трека'
  return 'треков'
}

export default function PlaylistView({ playlist, currentTrack, onPlay, onLike, isLiked }) {
  if (!playlist) {
    return (
      <div className="view">
        <div className="view__empty">
          <div className="view__empty-emoji">🎧</div>
          <div className="view__empty-text">Плейлист не найден</div>
        </div>
      </div>
    )
  }

  return (
    <div className="view">
      <div className="view__head">
        <h1 className="view__title view__title--grad">{playlist.name}</h1>
        <span className="view__sub">{playlist.tracks.length} {plural(playlist.tracks.length)}</span>
      </div>

      {playlist.tracks.length === 0 ? (
        <div className="view__empty">
          <div className="view__empty-emoji">✦</div>
          <div className="view__empty-text">В этом плейлисте пока пусто</div>
        </div>
      ) : (
        <div className="view__list">
          {playlist.tracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              onPlay={t => onPlay(t, playlist.tracks)}
              onLike={onLike}
              isLiked={isLiked(track.id)}
              isActive={currentTrack?.id === track.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
