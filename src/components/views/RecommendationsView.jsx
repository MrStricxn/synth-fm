import { useEffect } from 'react'
import TrackCard from '../TrackCard'
import TrackRow from '../TrackRow'
import PlayActions from '../PlayActions'
import { usePlayerStore } from '../../store/usePlayerStore'
import './views.css'

export default function RecommendationsView({ recs, loading, currentTrack, isPlaying, onPlay, onLike, isLiked }) {
  // Refresh recommendations when the view opens (cheap if already loaded).
  useEffect(() => {
    if (!recs.length) usePlayerStore.getState().loadRecommendations()
  }, [recs.length])

  if (loading && !recs.length) {
    return (
      <div className="view">
        <div className="view__head"><h1 className="view__title view__title--grad">Для тебя</h1></div>
        <div className="view__loading">Собираем подборку под твой вкус…</div>
      </div>
    )
  }

  if (!recs.length) {
    return (
      <div className="view">
        <div className="view__head"><h1 className="view__title view__title--grad">Для тебя</h1></div>
        <div className="view__empty">
          <div className="view__empty-emoji">✨</div>
          <div className="view__empty-text">Слушай и лайкай треки — и здесь появится подборка под тебя</div>
          <button className="view__tool" onClick={() => usePlayerStore.getState().loadRecommendations()}>Обновить</button>
        </div>
      </div>
    )
  }

  const grid = recs.slice(0, 6)

  return (
    <div className="view">
      <div className="view__head">
        <h1 className="view__title view__title--grad">Для тебя</h1>
        <span className="view__sub">Подобрано по твоим лайкам, прослушиваниям и жанрам</span>
        <div className="view__head-row">
          <PlayActions tracks={recs} />
          <div className="view__head-tools">
            <button className="view__tool" onClick={() => usePlayerStore.getState().loadRecommendations()}>Обновить</button>
          </div>
        </div>
      </div>

      <div className="library-view__grid">
        {grid.map(track => (
          <TrackCard key={track.id} track={track} onPlay={t => onPlay(t, recs)}
            isPlaying={currentTrack?.id === track.id && isPlaying} />
        ))}
      </div>

      <div className="view__section">Ещё рекомендации</div>
      <div className="view__list">
        {recs.map((track, i) => (
          <TrackRow key={track.id} track={track} index={i} onPlay={t => onPlay(t, recs)}
            onLike={onLike} isLiked={isLiked(track.id)} isActive={currentTrack?.id === track.id}
            duration={track.duration} />
        ))}
      </div>
    </div>
  )
}
