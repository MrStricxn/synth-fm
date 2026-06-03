import TrackRow from '../TrackRow'

export default function PlaylistView({ playlist, currentTrack, isPlaying, onPlay, onLike, isLiked }) {
  if (!playlist) return (
    <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 11 }}>Playlist not found.</div>
  )
  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%' }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--accent-pink)', textShadow: '0 0 6px var(--accent-pink)', marginBottom: 14 }}>
        ♫ {playlist.name.toUpperCase()} — {playlist.tracks.length} TRACKS
      </div>
      {playlist.tracks.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: 11, letterSpacing: 2 }}>NO TRACKS IN THIS PLAYLIST YET.</p>
      )}
      {playlist.tracks.map((track, i) => (
        <TrackRow key={track.id} track={track} index={i} onPlay={t => onPlay(t, playlist.tracks)} onLike={onLike} isLiked={isLiked(track.id)} isActive={currentTrack?.id === track.id} />
      ))}
    </div>
  )
}
