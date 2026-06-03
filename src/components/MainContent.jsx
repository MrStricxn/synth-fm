import { usePlayerStore } from '../store/usePlayerStore'
import LibraryView from './views/LibraryView'
import PlaylistView from './views/PlaylistView'
import DiscoverView from './views/DiscoverView'
import LikedView from './views/LikedView'

export default function MainContent() {
  const activeView       = usePlayerStore(s => s.activeView)
  const activePlaylistId = usePlayerStore(s => s.activePlaylistId)
  const currentTrack     = usePlayerStore(s => s.currentTrack)
  const isPlaying        = usePlayerStore(s => s.isPlaying)
  const library          = usePlayerStore(s => s.library)
  const playlists        = usePlayerStore(s => s.playlists)
  const liked            = usePlayerStore(s => s.liked)
  const searchQuery      = usePlayerStore(s => s.searchQuery)

  const { playTrack, toggleLike, isLiked } = usePlayerStore.getState()

  const filteredLibrary = searchQuery
    ? library.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : library

  if (activeView === 'playlists') {
    const playlist = playlists.find(p => p.id === activePlaylistId) || playlists[0]
    return <PlaylistView playlist={playlist} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
  }
  if (activeView === 'discover') {
    return <DiscoverView currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
  }
  if (activeView === 'liked') {
    return <LikedView liked={liked} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} />
  }
  return <LibraryView tracks={filteredLibrary} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
}
