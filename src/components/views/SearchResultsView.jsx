import TrackRow from '../TrackRow'
import './views.css'

export default function SearchResultsView({ query, tracks, currentTrack, onPlay, onLike, isLiked }) {
  const q = query.trim().toLowerCase()
  const results = tracks.filter(t =>
    t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
  )

  return (
    <div className="view">
      <div className="view__head">
        <h1 className="view__title">Поиск</h1>
        <span className="view__sub">«{query}» — {results.length} найдено</span>
      </div>

      {results.length === 0 ? (
        <div className="view__empty">
          <div className="view__empty-emoji">🔍</div>
          <div className="view__empty-text">Ничего не найдено по запросу «{query}»</div>
        </div>
      ) : (
        <div className="view__list">
          {results.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              onPlay={t => onPlay(t, results)}
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
