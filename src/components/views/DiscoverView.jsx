import TrackRow from '../TrackRow'
import { DISCOVER_TRACKS } from '../../data/library'

export default function DiscoverView({ currentTrack, onPlay, onLike, isLiked }) {
  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%' }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--accent-orange)', textShadow: '0 0 6px var(--accent-orange)', marginBottom: 14 }}>
        ⚡ DISCOVER — CURATED SYNTHWAVE
      </div>
      {DISCOVER_TRACKS.map((track, i) => (
        <TrackRow key={track.id} track={track} index={i} onPlay={t => onPlay(t, DISCOVER_TRACKS)} onLike={onLike} isLiked={isLiked(track.id)} isActive={currentTrack?.id === track.id} />
      ))}
    </div>
  )
}
