import { beforeEach, describe, expect, it } from 'vitest'
import { usePlayerStore } from '../usePlayerStore'
import { LIBRARY } from '../../data/library'

const track = LIBRARY[0]

beforeEach(() => {
  usePlayerStore.setState(usePlayerStore.getState().getInitialState())
})

describe('initial state', () => {
  it('starts with no current track', () => {
    expect(usePlayerStore.getState().currentTrack).toBeNull()
  })
  it('starts not playing', () => {
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })
  it('has library loaded', () => {
    expect(usePlayerStore.getState().library.length).toBeGreaterThan(0)
  })
  it('starts on library view', () => {
    expect(usePlayerStore.getState().activeView).toBe('library')
  })
})

describe('playTrack', () => {
  it('sets currentTrack and isPlaying', () => {
    usePlayerStore.getState().playTrack(track, LIBRARY)
    const state = usePlayerStore.getState()
    expect(state.currentTrack).toEqual(track)
    expect(state.isPlaying).toBe(true)
    expect(state.queue).toEqual(LIBRARY)
    expect(state.queueIndex).toBe(0)
  })
})

describe('togglePlay', () => {
  it('flips isPlaying', () => {
    usePlayerStore.setState({ isPlaying: false })
    usePlayerStore.getState().togglePlay()
    expect(usePlayerStore.getState().isPlaying).toBe(true)
    usePlayerStore.getState().togglePlay()
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })
})

describe('nextTrack', () => {
  it('advances queueIndex and sets currentTrack', () => {
    usePlayerStore.setState({ queue: LIBRARY, queueIndex: 0, currentTrack: LIBRARY[0] })
    usePlayerStore.getState().nextTrack()
    const state = usePlayerStore.getState()
    expect(state.queueIndex).toBe(1)
    expect(state.currentTrack).toEqual(LIBRARY[1])
  })
  it('wraps to 0 at end of queue', () => {
    usePlayerStore.setState({ queue: LIBRARY, queueIndex: LIBRARY.length - 1, currentTrack: LIBRARY[LIBRARY.length - 1] })
    usePlayerStore.getState().nextTrack()
    expect(usePlayerStore.getState().queueIndex).toBe(0)
  })
})

describe('prevTrack', () => {
  it('goes back one track', () => {
    usePlayerStore.setState({ queue: LIBRARY, queueIndex: 2, currentTrack: LIBRARY[2] })
    usePlayerStore.getState().prevTrack()
    expect(usePlayerStore.getState().queueIndex).toBe(1)
    expect(usePlayerStore.getState().currentTrack).toEqual(LIBRARY[1])
  })
  it('wraps to end at index 0', () => {
    usePlayerStore.setState({ queue: LIBRARY, queueIndex: 0, currentTrack: LIBRARY[0] })
    usePlayerStore.getState().prevTrack()
    expect(usePlayerStore.getState().queueIndex).toBe(LIBRARY.length - 1)
  })
})

describe('toggleLike', () => {
  it('adds track to liked', () => {
    usePlayerStore.getState().toggleLike(track)
    expect(usePlayerStore.getState().liked).toContainEqual(track)
  })
  it('removes track if already liked', () => {
    usePlayerStore.setState({ liked: [track] })
    usePlayerStore.getState().toggleLike(track)
    expect(usePlayerStore.getState().liked).not.toContainEqual(track)
  })
})

describe('isLiked', () => {
  it('returns true when track is liked', () => {
    usePlayerStore.setState({ liked: [track] })
    expect(usePlayerStore.getState().isLiked(track.id)).toBe(true)
  })
  it('returns false when track is not liked', () => {
    usePlayerStore.setState({ liked: [] })
    expect(usePlayerStore.getState().isLiked(track.id)).toBe(false)
  })
})

describe('createPlaylist', () => {
  it('adds a new playlist', () => {
    usePlayerStore.getState().createPlaylist('My Mix')
    const { playlists } = usePlayerStore.getState()
    expect(playlists).toHaveLength(1)
    expect(playlists[0].name).toBe('My Mix')
    expect(playlists[0].tracks).toEqual([])
  })
})

describe('addToPlaylist', () => {
  it('adds track to the correct playlist', () => {
    usePlayerStore.getState().createPlaylist('Mix')
    const { playlists } = usePlayerStore.getState()
    usePlayerStore.getState().addToPlaylist(playlists[0].id, track)
    expect(usePlayerStore.getState().playlists[0].tracks).toContainEqual(track)
  })
})

describe('setActiveView', () => {
  it('updates activeView', () => {
    usePlayerStore.getState().setActiveView('liked')
    expect(usePlayerStore.getState().activeView).toBe('liked')
  })
})

describe('setSearchQuery', () => {
  it('updates searchQuery', () => {
    usePlayerStore.getState().setSearchQuery('kavinsky')
    expect(usePlayerStore.getState().searchQuery).toBe('kavinsky')
  })
})

describe('setProgress', () => {
  it('updates progress and duration', () => {
    usePlayerStore.getState().setProgress(30000, 180000)
    const state = usePlayerStore.getState()
    expect(state.progress).toBe(30000)
    expect(state.duration).toBe(180000)
  })
})

describe('setVolume', () => {
  it('sets volume', () => {
    usePlayerStore.getState().setVolume(60)
    expect(usePlayerStore.getState().volume).toBe(60)
  })
})
