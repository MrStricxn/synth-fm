import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SEED_TRACKS, SEED_ARTISTS } from '../data/library'
import * as yandex from '../api/yandex'
import { supabase, isAuthConfigured } from '../api/supabase'

// Debounced push of the user's library to Supabase (cloud sync).
let _pushTimer = null

function dedupe(tracks) {
  const seen = new Set()
  const out = []
  for (const t of tracks) {
    if (!t || seen.has(t.id)) continue
    seen.add(t.id)
    out.push(t)
  }
  return out
}

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
  library: SEED_TRACKS,
  charts: SEED_TRACKS,
  catalogueLoaded: false,
  loadingCatalogue: false,
  playlists: [],
  liked: [],
  activeView: 'library',
  activePlaylistId: null,
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  recommendations: [],
  loadingRecs: false,
  // Genre preferences from onboarding (persisted) — seed the recommendations.
  genres: [],
  onboarded: false,
  fullscreen: false,
  prevVolume: 80,
  // Listening stats per track id: { plays, completed } — drives recommendations.
  stats: {},
  // Auth (runtime only — never persisted).
  user: null,
  authReady: false,
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

      // ── Yandex: live catalogue ────────────────────────────────────────────
      loadCatalogue: async () => {
        if (get().catalogueLoaded || get().loadingCatalogue) return
        set({ loadingCatalogue: true })
        try {
          const [chart, seed] = await Promise.all([
            yandex.trendingTracks(40).catch(() => []),
            yandex.resolveSeed(SEED_ARTISTS, 2).catch(() => []),
          ])
          const library = dedupe([...seed, ...chart, ...SEED_TRACKS])
          set({
            library: library.length ? library : SEED_TRACKS,
            charts: chart.length ? chart : SEED_TRACKS,
            catalogueLoaded: true,
            loadingCatalogue: false,
          })
        } catch {
          set({ loadingCatalogue: false })
        }
      },

      // ── Audius: search (debounced from the UI) ────────────────────────────
      setSearchQuery: (q) => {
        set({ searchQuery: q })
        const query = q.trim()
        if (!query) { set({ searchResults: [], searchLoading: false }); return }
        set({ searchLoading: true })
        // Tag this request so a slower earlier one can't overwrite a newer one.
        const token = (get()._searchToken || 0) + 1
        set({ _searchToken: token })
        yandex.searchTracks(query, 20)
          .then((results) => {
            if (get()._searchToken === token) set({ searchResults: dedupe(results), searchLoading: false })
          })
          .catch(() => {
            if (get()._searchToken === token) set({ searchResults: [], searchLoading: false })
          })
      },

      // ── Audius: personalised recommendations ──────────────────────────────
      // Built from the user's liked artists, listening stats and onboarding
      // genres. Every browser ends up with a different list because the inputs
      // (likes / plays / picked genres) are per-user in localStorage.
      loadRecommendations: async () => {
        if (get().loadingRecs) return
        set({ loadingRecs: true })
        const { liked, stats, genres, library } = get()

        // Rank liked + most-played artists as search seeds.
        const artistWeight = {}
        for (const t of liked) artistWeight[t.artist] = (artistWeight[t.artist] || 0) + 3
        for (const [id, s] of Object.entries(stats || {})) {
          const t = library.find(x => x.id === id)
          if (t) artistWeight[t.artist] = (artistWeight[t.artist] || 0) + (s.completed || 0) * 2 + (s.plays || 0)
        }
        const topArtists = Object.entries(artistWeight).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([a]) => a)

        try {
          const jobs = []
          for (const a of topArtists) jobs.push(yandex.searchTracks(a, 6).catch(() => []))
          for (const g of (genres || []).slice(0, 3)) jobs.push(yandex.searchTracks(g, 6).catch(() => []))
          // Cold start (no signal yet): fall back to the chart.
          if (!jobs.length) jobs.push(yandex.trendingTracks(20).catch(() => []))

          const batches = await Promise.all(jobs)
          const likedIds = new Set(liked.map(t => t.id))
          const recs = dedupe(batches.flat()).filter(t => !likedIds.has(t.id))
          set({ recommendations: recs, loadingRecs: false })
        } catch {
          set({ loadingRecs: false })
        }
      },

      setGenres: (genres) => set({ genres }),

      completeOnboarding: (genres) => set({ genres, onboarded: true }),

      // ── Auth (Supabase) ───────────────────────────────────────────────────
      initAuth: async () => {
        if (!isAuthConfigured) { set({ authReady: true }); return }
        try {
          const { data } = await supabase.auth.getSession()
          const user = data?.session?.user || null
          set({ user, authReady: true })
          if (user) get().pullCloud(user.id)
          supabase.auth.onAuthStateChange((_event, session) => {
            const u = session?.user || null
            set({ user: u })
            if (u) get().pullCloud(u.id)
          })
        } catch {
          set({ authReady: true })
        }
      },

      signUpEmail: async (email, password) => {
        if (!supabase) return { error: 'Auth не настроен' }
        const { error } = await supabase.auth.signUp({ email, password })
        return { error: error?.message || null }
      },

      signInEmail: async (email, password) => {
        if (!supabase) return { error: 'Auth не настроен' }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message || null }
      },

      signInOAuth: async (provider) => {
        if (!supabase) return { error: 'Auth не настроен' }
        const { error } = await supabase.auth.signInWithOAuth({
          provider, // 'google' | 'discord'
          options: { redirectTo: window.location.origin },
        })
        return { error: error?.message || null }
      },

      signOut: async () => {
        if (supabase) await supabase.auth.signOut()
        set({ user: null })
      },

      // ── Cloud sync of liked / playlists / genres ──────────────────────────
      pullCloud: async (userId) => {
        if (!supabase) return
        try {
          const { data, error } = await supabase
            .from('user_state')
            .select('liked, playlists, genres')
            .eq('user_id', userId)
            .maybeSingle()
          if (error) return
          if (data) {
            // Cloud is the source of truth on login → consistent across devices.
            set({
              liked: data.liked || [],
              playlists: data.playlists || [],
              genres: data.genres || [],
              onboarded: true,
            })
          } else {
            // First login on this account → seed the cloud from local state.
            get().pushCloud(true)
          }
        } catch { /* offline / table missing — stay on local state */ }
      },

      pushCloud: (immediate = false) => {
        const { user } = get()
        if (!supabase || !user) return
        clearTimeout(_pushTimer)
        const run = async () => {
          const { liked, playlists, genres } = get()
          try {
            await supabase.from('user_state').upsert({
              user_id: user.id,
              liked, playlists, genres,
              updated_at: new Date().toISOString(),
            })
          } catch { /* ignore transient errors */ }
        }
        if (immediate) run()
        else _pushTimer = setTimeout(run, 1200)
      },

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
      partialize: (s) => ({ liked: s.liked, playlists: s.playlists, volume: s.volume, stats: s.stats, genres: s.genres, onboarded: s.onboarded }),
    }
  )
)
