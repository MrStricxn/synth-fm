import { usePlayerStore } from '../store/usePlayerStore'
import { ALL_TRACKS } from '../data/library'
import LibraryView from './views/LibraryView'
import PlaylistView from './views/PlaylistView'
import DiscoverView from './views/DiscoverView'
import LikedView from './views/LikedView'
import RecommendationsView from './views/RecommendationsView'
import SearchResultsView from './views/SearchResultsView'

export default function MainContent() {
  const activeView       = usePlayerStore(s => s.activeView)
  const activePlaylistId = usePlayerStore(s => s.activePlaylistId)
  const currentTrack     = usePlayerStore(s => s.currentTrack)
  const isPlaying        = usePlayerStore(s => s.isPlaying)
  const library          = usePlayerStore(s => s.library)
  const playlists        = usePlayerStore(s => s.playlists)
  const liked            = usePlayerStore(s => s.liked)
  const stats            = usePlayerStore(s => s.stats)
  const searchQuery      = usePlayerStore(s => s.searchQuery)

  const { playTrack, toggleLike, isLiked } = usePlayerStore.getState()

  // Search is global — it overrides the active view and searches the whole catalogue.
  if (searchQuery.trim()) {
    return <SearchResultsView query={searchQuery} tracks={ALL_TRACKS} currentTrack={currentTrack} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
  }

  if (activeView === 'playlists') {
    const playlist = playlists.find(p => p.id === activePlaylistId) || playlists[0]
    return <PlaylistView playlist={playlist} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
  }
  if (activeView === 'discover') {
    return <DiscoverView currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
  }
  if (activeView === 'recommend') {
    return <RecommendationsView catalog={ALL_TRACKS} liked={liked} stats={stats} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
  }
  if (activeView === 'liked') {
    return <LikedView liked={liked} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} />
  }
  return <LibraryView tracks={library} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
}
