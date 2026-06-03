import TrackCard from '../TrackCard'
import TrackRow from '../TrackRow'
import './LibraryView.css'

const ACCENT_COLORS = [
  'var(--accent-purple)', 'var(--accent-cyan)',
  'var(--accent-pink)', 'var(--accent-orange)', 'var(--accent-green)',
]

export default function LibraryView({ tracks, currentTrack, isPlaying, onPlay, onLike, isLiked }) {
  if (!tracks.length) {
    return (
      <div className="library-view">
        <p className="library-view__empty">NO TRACKS FOUND</p>
      </div>
    )
  }

  const gridTracks = tracks.slice(0, 8)

  return (
    <div className="library-view">
      <div className="view-heading" style={{ color: 'var(--accent-purple)', textShadow: '0 0 6px var(--accent-purple)' }}>
        LIBRARY — {tracks.length} TRACKS
      </div>
      <div className="library-view__grid">
        {gridTracks.map((track, i) => (
          <TrackCard
            key={track.id}
            track={track}
            onPlay={t => onPlay(t, tracks)}
            isPlaying={currentTrack?.id === track.id && isPlaying}
            accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length]}
          />
        ))}
      </div>
      <div className="library-view__list-heading" style={{ color: 'var(--accent-cyan)', textShadow: '0 0 6px var(--accent-cyan)' }}>
        ALL TRACKS
      </div>
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
  )
}
