import TrackRow from '../TrackRow'
import { CHARTS_RU, CHARTS_US } from '../../data/library'
import './views.css'

function Chart({ title, accent, tracks, currentTrack, onPlay, onLike, isLiked }) {
  return (
    <>
      <div className="view__section" style={{ color: accent }}>{title}</div>
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
    </>
  )
}

export default function DiscoverView({ currentTrack, onPlay, onLike, isLiked }) {
  return (
    <div className="view">
      <div className="view__head">
        <h1 className="view__title view__title--grad">Чарты</h1>
        <span className="view__sub">Популярное в России и США</span>
      </div>
      <Chart title="🇷🇺 Популярное в России" accent="var(--brand-2)" tracks={CHARTS_RU}
        currentTrack={currentTrack} onPlay={onPlay} onLike={onLike} isLiked={isLiked} />
      <Chart title="🇺🇸 Популярное в США" accent="var(--accent-cyan)" tracks={CHARTS_US}
        currentTrack={currentTrack} onPlay={onPlay} onLike={onLike} isLiked={isLiked} />
    </div>
  )
}
