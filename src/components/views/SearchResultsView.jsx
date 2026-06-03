import TrackRow from '../TrackRow'
import PlayActions from '../PlayActions'
import './views.css'

// Live Audius search results (fetched in the store, debounced via setSearchQuery).
export default function SearchResultsView({ query, results, loading, currentTrack, onPlay, onLike, isLiked }) {
  return (
    <div className="view">
      <div className="view__head">
        <h1 className="view__title">Поиск</h1>
        <span className="view__sub">
          «{query}»{loading ? ' — ищем…' : ` — ${results.length} найдено`}
        </span>
        {!loading && results.length > 0 && <PlayActions tracks={results} />}
      </div>

      {loading && !results.length ? (
        <div className="view__loading">Ищем на Audius…</div>
      ) : results.length === 0 ? (
        <div className="view__empty">
          <div className="view__empty-emoji">🔍</div>
          <div className="view__empty-text">Ничего не найдено по запросу «{query}»</div>
        </div>
      ) : (
        <div className="view__list">
          {results.map((track, i) => (
            <TrackRow key={track.id} track={track} index={i} onPlay={t => onPlay(t, results)}
              onLike={onLike} isLiked={isLiked(track.id)} isActive={currentTrack?.id === track.id}
              duration={track.duration} />
          ))}
        </div>
      )}
    </div>
  )
}
