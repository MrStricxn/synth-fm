import TrackRow from '../TrackRow'
import { DISCOVER_TRACKS } from '../../data/library'
import './views.css'

export default function DiscoverView({ currentTrack, onPlay, onLike, isLiked }) {
  return (
    <div className="view">
      <div className="view__head">
        <h1 className="view__title view__title--grad">Новинки</h1>
        <span className="view__sub">Подборка специально для тебя</span>
      </div>
      <div className="view__list">
        {DISCOVER_TRACKS.map((track, i) => (
          <TrackRow
            key={track.id}
            track={track}
            index={i}
            onPlay={t => onPlay(t, DISCOVER_TRACKS)}
            onLike={onLike}
            isLiked={isLiked(track.id)}
            isActive={currentTrack?.id === track.id}
          />
        ))}
      </div>
    </div>
  )
}
