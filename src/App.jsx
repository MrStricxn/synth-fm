import './App.css'
import { usePlayerStore } from './store/usePlayerStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import SCWidget from './components/SCWidget'
import ParticleField from './components/ParticleField'
import DynamicBackground from './components/DynamicBackground'
import NowPlaying from './components/NowPlaying'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import PlayerBar from './components/PlayerBar'

export default function App() {
  useKeyboardShortcuts()

  const activeView       = usePlayerStore(s => s.activeView)
  const activePlaylistId = usePlayerStore(s => s.activePlaylistId)
  const playlists        = usePlayerStore(s => s.playlists)
  const searchQuery      = usePlayerStore(s => s.searchQuery)
  const currentTrack     = usePlayerStore(s => s.currentTrack)
  const isPlaying        = usePlayerStore(s => s.isPlaying)
  const progress         = usePlayerStore(s => s.progress)
  const duration         = usePlayerStore(s => s.duration)
  const volume           = usePlayerStore(s => s.volume)
  const shuffle          = usePlayerStore(s => s.shuffle)
  const repeat           = usePlayerStore(s => s.repeat)
  const fullscreen       = usePlayerStore(s => s.fullscreen)

  const {
    setActiveView, setSearchQuery, createPlaylist,
    togglePlay, nextTrack, prevTrack, setProgress, setVolume,
    toggleLike, isLiked, toggleShuffle, cycleRepeat, toggleFullscreen,
  } = usePlayerStore.getState()

  function handleNewPlaylist() {
    const name = window.prompt('Playlist name:')
    if (name?.trim()) createPlaylist(name.trim())
  }

  function handleSeek(ms) {
    setProgress(ms, duration)
    window.dispatchEvent(new CustomEvent('sc:seek', { detail: ms }))
  }

  return (
    <div className={`app${fullscreen ? ' app--fs' : ''}`}>
      <SCWidget />
      <ParticleField />
      <DynamicBackground />
      <div className="app__grain" aria-hidden="true" />
      <TopBar searchQuery={searchQuery} onSearch={setSearchQuery} />
      <div className="app__body">
        <Sidebar
          activeView={activeView}
          activePlaylistId={activePlaylistId}
          playlists={playlists}
          onNav={setActiveView}
          onNewPlaylist={handleNewPlaylist}
        />
        <div className="app__main">
          <MainContent />
        </div>
      </div>
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        volume={volume}
        isLiked={currentTrack ? isLiked(currentTrack.id) : false}
        shuffle={shuffle}
        repeat={repeat}
        onTogglePlay={togglePlay}
        onNext={nextTrack}
        onPrev={prevTrack}
        onSeek={handleSeek}
        onVolume={setVolume}
        onLike={toggleLike}
        onShuffle={toggleShuffle}
        onRepeat={cycleRepeat}
        onExpand={toggleFullscreen}
      />
      <NowPlaying />
    </div>
  )
}
