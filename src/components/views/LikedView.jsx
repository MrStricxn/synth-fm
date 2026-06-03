import TrackRow from '../TrackRow'

export default function LikedView({ liked, currentTrack, onPlay, onLike }) {
  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%' }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--accent-pink)', textShadow: '0 0 6px var(--accent-pink)', marginBottom: 14 }}>
        ♥ LIKED — {liked.length} TRACKS
      </div>
      {liked.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: 11, letterSpacing: 2 }}>NO LIKED TRACKS YET. HIT ♥ ON ANY TRACK.</p>
      )}
      {liked.map((track, i) => (
        <TrackRow key={track.id} track={track} index={i} onPlay={t => onPlay(t, liked)} onLike={onLike} isLiked={true} isActive={currentTrack?.id === track.id} />
      ))}
    </div>
  )
}
