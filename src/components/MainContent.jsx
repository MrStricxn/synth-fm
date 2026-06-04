import { usePlayerStore } from '../store/usePlayerStore'
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
  const charts           = usePlayerStore(s => s.charts)
  const loadingCatalogue = usePlayerStore(s => s.loadingCatalogue)
  const playlists        = usePlayerStore(s => s.playlists)
  const liked            = usePlayerStore(s => s.liked)
  const searchQuery      = usePlayerStore(s => s.searchQuery)
  const searchResults    = usePlayerStore(s => s.searchResults)
  const searchLoading    = usePlayerStore(s => s.searchLoading)
  const recommendations  = usePlayerStore(s => s.recommendations)
  const loadingRecs      = usePlayerStore(s => s.loadingRecs)

  const { playTrack, toggleLike, isLiked } = usePlayerStore.getState()

  // Search is global — it overrides the active view and queries Yandex live.
  if (searchQuery.trim()) {
    return <SearchResultsView query={searchQuery} results={searchResults} loading={searchLoading}
      currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
  }

  if (activeView === 'playlists') {
    const playlist = playlists.find(p => p.id === activePlaylistId) || playlists[0]
    return <PlaylistView playlist={playlist} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
  }
  if (activeView === 'discover') {
    return <DiscoverView tracks={charts} loading={loadingCatalogue} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
  }
  if (activeView === 'recommend') {
    return <RecommendationsView recs={recommendations} loading={loadingRecs} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
  }
  if (activeView === 'liked') {
    return <LikedView liked={liked} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} />
  }
  return <LibraryView tracks={library} loading={loadingCatalogue} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} onLike={toggleLike} isLiked={isLiked} />
}
