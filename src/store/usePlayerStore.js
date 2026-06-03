import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { LIBRARY } from '../data/library'

// Safe in-memory storage fallback for environments without localStorage
const memoryStorage = (() => {
  const store = new Map()
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  }
})()

function getSafeStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Test if it actually works
      window.localStorage.setItem('__test__', '1')
      window.localStorage.removeItem('__test__')
      return window.localStorage
    }
  } catch {
    // fall through
  }
  return memoryStorage
}

const initialState = {
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 80,
  queue: [],
  queueIndex: 0,
  shuffle: false,
  repeat: 'none',
  library: LIBRARY,
  playlists: [],
  liked: [],
  activeView: 'library',
  activePlaylistId: null,
  searchQuery: '',
  fullscreen: false,
  prevVolume: 80,
}

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      getInitialState: () => initialState,

      playTrack: (track, queue = []) => {
        const index = queue.findIndex(t => t.id === track.id)
        set({
          currentTrack: track,
          isPlaying: true,
          queue,
          queueIndex: index >= 0 ? index : 0,
          progress: 0,
          duration: 0,
        })
      },

      togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),

      nextTrack: () => {
        const { queue, queueIndex, shuffle } = get()
        if (!queue.length) return
        let next
        if (shuffle) {
          next = Math.floor(Math.random() * queue.length)
        } else {
          next = (queueIndex + 1) % queue.length
        }
        set({ queueIndex: next, currentTrack: queue[next], isPlaying: true, progress: 0, duration: 0 })
      },

      prevTrack: () => {
        const { queue, queueIndex } = get()
        if (!queue.length) return
        const prev = (queueIndex - 1 + queue.length) % queue.length
        set({ queueIndex: prev, currentTrack: queue[prev], isPlaying: true, progress: 0, duration: 0 })
      },

      toggleLike: (track) => set(s => {
        const already = s.liked.some(t => t.id === track.id)
        return { liked: already ? s.liked.filter(t => t.id !== track.id) : [...s.liked, track] }
      }),

      isLiked: (trackId) => get().liked.some(t => t.id === trackId),

      createPlaylist: (name) => set(s => ({
        playlists: [...s.playlists, { id: crypto.randomUUID(), name, tracks: [] }],
      })),

      addToPlaylist: (playlistId, track) => set(s => ({
        playlists: s.playlists.map(p =>
          p.id === playlistId && !p.tracks.some(t => t.id === track.id)
            ? { ...p, tracks: [...p.tracks, track] }
            : p
        ),
      })),

      setActiveView: (view, playlistId = null) => set({ activeView: view, activePlaylistId: playlistId }),

      setSearchQuery: (q) => set({ searchQuery: q }),

      setProgress: (progress, duration) => set(s => ({ progress, duration: duration || s.duration })),

      setDuration: (duration) => set({ duration }),

      setVolume: (volume) => set({ volume }),

      toggleMute: () => set(s => (
        s.volume > 0
          ? { volume: 0, prevVolume: s.volume }
          : { volume: s.prevVolume || 80 }
      )),

      setFullscreen: (fullscreen) => set({ fullscreen }),

      toggleFullscreen: () => set(s => ({ fullscreen: !s.fullscreen })),

      toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),

      cycleRepeat: () => set(s => ({
        repeat: s.repeat === 'none' ? 'all' : s.repeat === 'all' ? 'one' : 'none',
      })),
    }),
    {
      name: 'synthwave-player',
      storage: createJSONStorage(() => getSafeStorage()),
      partialize: (s) => ({ liked: s.liked, playlists: s.playlists, volume: s.volume }),
    }
  )
)
