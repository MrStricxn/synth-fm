import TrackCard from '../TrackCard'
import TrackRow from '../TrackRow'
import PlayActions from '../PlayActions'
import { recommend } from '../../utils/recommend'
import './views.css'

export default function RecommendationsView({ catalog, liked, stats, currentTrack, isPlaying, onPlay, onLike, isLiked }) {
  const recs = recommend(catalog, liked, stats, 12)
  const hasSignal = liked.length > 0 || Object.keys(stats || {}).length > 0

  if (!recs.length) {
    return (
      <div className="view">
        <div className="view__empty">
          <div className="view__empty-emoji">✨</div>
          <div className="view__empty-text">Слушай и лайкай треки — и здесь появятся рекомендации для тебя</div>
        </div>
      </div>
    )
  }

  const grid = recs.slice(0, 6)

  return (
    <div className="view">
      <div className="view__head">
        <h1 className="view__title view__title--grad">Для тебя</h1>
        <span className="view__sub">
          {hasSignal ? 'Подобрано по твоим лайкам и прослушиваниям' : 'Начни слушать — подборка станет точнее'}
        </span>
        <PlayActions tracks={recs} />
      </div>

      <div className="library-view__grid">
        {grid.map(track => (
          <TrackCard
            key={track.id}
            track={track}
            onPlay={t => onPlay(t, recs)}
            isPlaying={currentTrack?.id === track.id && isPlaying}
          />
        ))}
      </div>

      <div className="view__section">Ещё рекомендации</div>
      <div className="view__list">
        {recs.map((track, i) => (
          <TrackRow
            key={track.id}
            track={track}
            index={i}
            onPlay={t => onPlay(t, recs)}
            onLike={onLike}
            isLiked={isLiked(track.id)}
            isActive={currentTrack?.id === track.id}
          />
        ))}
      </div>
    </div>
  )
}
