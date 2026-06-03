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

describe('toggleMute', () => {
  it('mutes and remembers the previous volume', () => {
    usePlayerStore.setState({ volume: 70 })
    usePlayerStore.getState().toggleMute()
    expect(usePlayerStore.getState().volume).toBe(0)
    expect(usePlayerStore.getState().prevVolume).toBe(70)
  })
  it('restores the previous volume when unmuting', () => {
    usePlayerStore.setState({ volume: 70 })
    usePlayerStore.getState().toggleMute()
    usePlayerStore.getState().toggleMute()
    expect(usePlayerStore.getState().volume).toBe(70)
  })
})

describe('fullscreen', () => {
  it('toggles fullscreen', () => {
    expect(usePlayerStore.getState().fullscreen).toBe(false)
    usePlayerStore.getState().toggleFullscreen()
    expect(usePlayerStore.getState().fullscreen).toBe(true)
  })
  it('setFullscreen sets explicitly', () => {
    usePlayerStore.getState().setFullscreen(true)
    expect(usePlayerStore.getState().fullscreen).toBe(true)
    usePlayerStore.getState().setFullscreen(false)
    expect(usePlayerStore.getState().fullscreen).toBe(false)
  })
})

describe('setProgress preserves duration', () => {
  it('keeps the existing duration when called without one', () => {
    usePlayerStore.setState({ duration: 180000 })
    usePlayerStore.getState().setProgress(5000, 0)
    expect(usePlayerStore.getState().duration).toBe(180000)
    expect(usePlayerStore.getState().progress).toBe(5000)
  })
})

describe('setActiveView clears search', () => {
  it('resets searchQuery so navigation is never trapped behind search', () => {
    usePlayerStore.setState({ searchQuery: 'oxxxymiron' })
    usePlayerStore.getState().setActiveView('liked')
    expect(usePlayerStore.getState().activeView).toBe('liked')
    expect(usePlayerStore.getState().searchQuery).toBe('')
  })
})

describe('playAll', () => {
  it('queues the whole list and plays from the start', () => {
    usePlayerStore.getState().playAll(LIBRARY)
    const s = usePlayerStore.getState()
    expect(s.queue).toEqual(LIBRARY)
    expect(s.queueIndex).toBe(0)
    expect(s.currentTrack).toEqual(LIBRARY[0])
    expect(s.isPlaying).toBe(true)
  })
  it('turns shuffle on when started shuffled', () => {
    usePlayerStore.getState().playAll(LIBRARY, true)
    expect(usePlayerStore.getState().shuffle).toBe(true)
    expect(usePlayerStore.getState().isPlaying).toBe(true)
  })
  it('does nothing for an empty list', () => {
    usePlayerStore.getState().playAll([])
    expect(usePlayerStore.getState().currentTrack).toBeNull()
  })
})

describe('advanceAuto', () => {
  it('replays the same track on repeat=one', () => {
    usePlayerStore.setState({ queue: LIBRARY, queueIndex: 1, currentTrack: LIBRARY[1], repeat: 'one' })
    const result = usePlayerStore.getState().advanceAuto()
    expect(result).toBe('repeat-one')
    expect(usePlayerStore.getState().queueIndex).toBe(1)
    expect(usePlayerStore.getState().currentTrack).toEqual(LIBRARY[1])
  })
  it('stops at the end of the queue when repeat=none', () => {
    usePlayerStore.setState({ queue: LIBRARY, queueIndex: LIBRARY.length - 1, currentTrack: LIBRARY.at(-1), repeat: 'none' })
    const result = usePlayerStore.getState().advanceAuto()
    expect(result).toBe('stop')
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })
  it('wraps to the start at the end when repeat=all', () => {
    usePlayerStore.setState({ queue: LIBRARY, queueIndex: LIBRARY.length - 1, currentTrack: LIBRARY.at(-1), repeat: 'all' })
    const result = usePlayerStore.getState().advanceAuto()
    expect(result).toBe('next')
    expect(usePlayerStore.getState().queueIndex).toBe(0)
  })
  it('advances normally mid-queue', () => {
    usePlayerStore.setState({ queue: LIBRARY, queueIndex: 0, currentTrack: LIBRARY[0], repeat: 'none' })
    usePlayerStore.getState().advanceAuto()
    expect(usePlayerStore.getState().queueIndex).toBe(1)
  })
})

describe('shuffle next never repeats the current track', () => {
  it('picks a different index every time on a 2-track queue', () => {
    const two = LIBRARY.slice(0, 2)
    usePlayerStore.setState({ queue: two, queueIndex: 0, currentTrack: two[0], shuffle: true })
    for (let i = 0; i < 20; i++) {
      usePlayerStore.setState({ queueIndex: 0, currentTrack: two[0] })
      usePlayerStore.getState().nextTrack()
      expect(usePlayerStore.getState().queueIndex).toBe(1)
    }
  })
})

describe('playlist management', () => {
  it('removes a track from a playlist', () => {
    usePlayerStore.getState().createPlaylist('Mix')
    const pid = usePlayerStore.getState().playlists[0].id
    usePlayerStore.getState().addToPlaylist(pid, track)
    usePlayerStore.getState().removeFromPlaylist(pid, track.id)
    expect(usePlayerStore.getState().playlists[0].tracks).toHaveLength(0)
  })
  it('renames a playlist', () => {
    usePlayerStore.getState().createPlaylist('Old')
    const pid = usePlayerStore.getState().playlists[0].id
    usePlayerStore.getState().renamePlaylist(pid, 'New')
    expect(usePlayerStore.getState().playlists[0].name).toBe('New')
  })
  it('deletes a playlist and resets the view if it was open', () => {
    usePlayerStore.getState().createPlaylist('Temp')
    const pid = usePlayerStore.getState().playlists[0].id
    usePlayerStore.getState().setActiveView('playlists', pid)
    usePlayerStore.getState().deletePlaylist(pid)
    expect(usePlayerStore.getState().playlists).toHaveLength(0)
    expect(usePlayerStore.getState().activeView).toBe('library')
    expect(usePlayerStore.getState().activePlaylistId).toBeNull()
  })
})
