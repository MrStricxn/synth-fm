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
  // Listening stats per track id: { plays, completed } — drives recommendations.
  stats: {},
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

      // Start a whole list as the queue. shuffleStart=true turns shuffle on and
      // begins from a random track — used by the "Перемешать" header button.
      playAll: (tracks, shuffleStart = false) => {
        if (!tracks || !tracks.length) return
        const index = shuffleStart ? Math.floor(Math.random() * tracks.length) : 0
        set(s => ({
          queue: tracks,
          queueIndex: index,
          currentTrack: tracks[index],
          isPlaying: true,
          progress: 0,
          duration: 0,
          shuffle: shuffleStart ? true : s.shuffle,
        }))
      },

      togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),

      // Pick a shuffle target that isn't the track currently playing.
      _shuffleNext: (len, current) => {
        if (len <= 1) return 0
        let n = Math.floor(Math.random() * len)
        if (n === current) n = (n + 1) % len
        return n
      },

      nextTrack: () => {
        const { queue, queueIndex, shuffle, _shuffleNext } = get()
        if (!queue.length) return
        const next = shuffle
          ? _shuffleNext(queue.length, queueIndex)
          : (queueIndex + 1) % queue.length
        set({ queueIndex: next, currentTrack: queue[next], isPlaying: true, progress: 0, duration: 0 })
      },

      prevTrack: () => {
        const { queue, queueIndex } = get()
        if (!queue.length) return
        const prev = (queueIndex - 1 + queue.length) % queue.length
        set({ queueIndex: prev, currentTrack: queue[prev], isPlaying: true, progress: 0, duration: 0 })
      },

      // Auto-advance when a track finishes. Honours the repeat mode and returns
      // a string so the widget knows how to react ('one' must replay in place).
      advanceAuto: () => {
        const { queue, queueIndex, shuffle, repeat, _shuffleNext } = get()
        if (!queue.length) return 'stop'

        if (repeat === 'one') {
          set({ progress: 0, isPlaying: true })
          return 'repeat-one'
        }

        let next
        if (shuffle) {
          next = _shuffleNext(queue.length, queueIndex)
        } else {
          next = queueIndex + 1
          if (next >= queue.length) {
            if (repeat === 'all') {
              next = 0
            } else {
              // End of queue, no repeat: stop on the last track.
              set({ isPlaying: false, progress: 0 })
              return 'stop'
            }
          }
        }
        set({ queueIndex: next, currentTrack: queue[next], isPlaying: true, progress: 0, duration: 0 })
        return 'next'
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

      removeFromPlaylist: (playlistId, trackId) => set(s => ({
        playlists: s.playlists.map(p =>
          p.id === playlistId
            ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) }
            : p
        ),
      })),

      renamePlaylist: (playlistId, name) => set(s => ({
        playlists: s.playlists.map(p => (p.id === playlistId ? { ...p, name } : p)),
      })),

      deletePlaylist: (playlistId) => set(s => ({
        playlists: s.playlists.filter(p => p.id !== playlistId),
        activeView: s.activePlaylistId === playlistId ? 'library' : s.activeView,
        activePlaylistId: s.activePlaylistId === playlistId ? null : s.activePlaylistId,
      })),

      // Changing view always clears any active search so navigation never gets
      // "stuck" behind search results.
      setActiveView: (view, playlistId = null) => set({ activeView: view, activePlaylistId: playlistId, searchQuery: '' }),

      setSearchQuery: (q) => set({ searchQuery: q }),

      setProgress: (progress, duration) => set(s => ({ progress, duration: duration || s.duration })),

      setDuration: (duration) => set({ duration }),

      // Record a listen. completed=true means the track played to the end.
      recordListen: (trackId, completed) => set(s => {
        const cur = s.stats[trackId] || { plays: 0, completed: 0 }
        return {
          stats: {
            ...s.stats,
            [trackId]: {
              plays: cur.plays + 1,
              completed: cur.completed + (completed ? 1 : 0),
            },
          },
        }
      }),

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
      partialize: (s) => ({ liked: s.liked, playlists: s.playlists, volume: s.volume, stats: s.stats }),
    }
  )
)
