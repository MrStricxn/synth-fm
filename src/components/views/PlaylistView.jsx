import TrackRow from '../TrackRow'
import PlayActions from '../PlayActions'
import { usePlayerStore } from '../../store/usePlayerStore'
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

  const store = usePlayerStore.getState()

  function handleRename() {
    const name = window.prompt('Новое название плейлиста:', playlist.name)
    if (name?.trim()) store.renamePlaylist(playlist.id, name.trim())
  }

  function handleDelete() {
    if (window.confirm(`Удалить плейлист «${playlist.name}»?`)) {
      store.deletePlaylist(playlist.id)
    }
  }

  return (
    <div className="view">
      <div className="view__head">
        <h1 className="view__title view__title--grad">{playlist.name}</h1>
        <span className="view__sub">{playlist.tracks.length} {plural(playlist.tracks.length)}</span>
        <div className="view__head-row">
          <PlayActions tracks={playlist.tracks} />
          <div className="view__head-tools">
            <button className="view__tool" onClick={handleRename}>Переименовать</button>
            <button className="view__tool view__tool--danger" onClick={handleDelete}>Удалить</button>
          </div>
        </div>
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
              onRemove={t => store.removeFromPlaylist(playlist.id, t.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
