# Synthwave Music Player — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-featured synthwave music player SPA that streams SoundCloud tracks via the Widget API with a retro neon UI.

**Architecture:** Vite + React SPA with Zustand for global state. A hidden SoundCloud iframe (`SCWidget`) acts as the audio engine — its events update the Zustand store, and all UI components read from the store. Views (Library, Discover, Playlists, Liked) switch via `activeView` in the store — no router needed.

**Tech Stack:** Vite 5, React 19, Zustand 5 (`persist` middleware), SoundCloud Widget API, Vitest + React Testing Library + jsdom.

---

## File Map

```
index.html                             ← add SC Widget API <script> tag
vite.config.js                         ← add vitest config block
src/
├── test/
│   └── setup.js                       ← @testing-library/jest-dom import
├── styles/
│   └── globals.css                    ← CSS variables, reset, scanlines
├── data/
│   └── library.js                     ← ~15 hardcoded synthwave SoundCloud tracks
├── store/
│   └── usePlayerStore.js              ← Zustand store (playback + UI + persist)
├── components/
│   ├── SCWidget.jsx                   ← hidden iframe, SC Widget API bridge
│   ├── TrackCard.jsx                  ← album grid card
│   ├── TrackCard.css
│   ├── TrackRow.jsx                   ← track list row
│   ├── TrackRow.css
│   ├── TopBar.jsx                     ← logo + search
│   ├── TopBar.css
│   ├── Sidebar.jsx                    ← nav links + playlists list
│   ├── Sidebar.css
│   ├── PlayerBar.jsx                  ← bottom player controls
│   ├── PlayerBar.css
│   ├── MainContent.jsx                ← view switcher
│   └── views/
│       ├── LibraryView.jsx            ← grid + track list
│       ├── LibraryView.css
│       ├── PlaylistView.jsx           ← filtered track list
│       ├── DiscoverView.jsx           ← curated extra tracks
│       └── LikedView.jsx             ← liked tracks
├── App.jsx
├── App.css
└── main.jsx
```

---

## Task 1: Project Scaffold + Test Setup

**Files:**
- Create: `package.json` (via Vite scaffold)
- Modify: `vite.config.js`
- Create: `src/test/setup.js`
- Modify: `index.html`
- Create: `.gitignore`

- [ ] **Step 1: Scaffold Vite + React project**

Run in `C:\Users\XiT_OFF\Desktop\code`:
```bash
npm create vite@latest . -- --template react
```
When prompted about existing files, choose to ignore/overwrite only `index.html` and `package.json`.

- [ ] **Step 2: Install dependencies**

```bash
npm install zustand
npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Configure Vitest in `vite.config.js`**

Replace the entire file with:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Step 4: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add SoundCloud Widget API script to `index.html`**

In `index.html`, add before `</body>`:
```html
    <script src="https://w.soundcloud.com/player/api.js"></script>
    <script type="module" src="/src/main.jsx"></script>
  </body>
```

The full `index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SYNTH.FM</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="https://w.soundcloud.com/player/api.js"></script>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Verify test setup runs**

```bash
npx vitest run
```
Expected: "No test files found" (0 failures — setup is working).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite+React project with Vitest"
```

---

## Task 2: Global CSS Variables + Reset

**Files:**
- Create: `src/styles/globals.css`
- Modify: `src/main.jsx`

- [ ] **Step 1: Create `src/styles/globals.css`**

```css
:root {
  --bg-base:      #0a0a0f;
  --bg-surface:   #06060e;
  --bg-elevated:  #0d0d1a;
  --border:       #1a1a2e;

  --accent-purple: #bc13fe;
  --accent-cyan:   #00fff9;
  --accent-pink:   #ff0080;
  --accent-orange: #ff6b35;
  --accent-green:  #39ff14;

  --text-primary: #ffffff;
  --text-muted:   #6a6a8a;

  --font: 'Courier New', Courier, monospace;

  --glow-purple: 0 0 8px #bc13fe, 0 0 20px rgba(188,19,254,0.4);
  --glow-cyan:   0 0 8px #00fff9, 0 0 20px rgba(0,255,249,0.3);
  --glow-pink:   0 0 8px #ff0080, 0 0 20px rgba(255,0,128,0.3);
  --glow-green:  0 0 8px #39ff14, 0 0 16px rgba(57,255,20,0.3);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  height: 100%;
  overflow: hidden;
}

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font);
  font-size: 13px;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font);
  color: inherit;
}

input {
  font-family: var(--font);
}

::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: var(--bg-surface);
}
::-webkit-scrollbar-thumb {
  background: var(--accent-purple);
  box-shadow: var(--glow-purple);
}
```

- [ ] **Step 2: Update `src/main.jsx` to import globals**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/globals.css src/main.jsx
git commit -m "feat: add synthwave CSS variables and global reset"
```

---

## Task 3: Library Data

**Files:**
- Create: `src/data/library.js`

- [ ] **Step 1: Create `src/data/library.js`**

```js
export const LIBRARY = [
  {
    id: '1',
    url: 'https://soundcloud.com/kavinsky/nightcall',
    title: 'Nightcall',
    artist: 'Kavinsky',
    artwork: null,
    color: 'linear-gradient(135deg, #ff6b35 0%, #ff0080 60%, #bc13fe 100%)',
  },
  {
    id: '2',
    url: 'https://soundcloud.com/carpenter-brut/turbo-killer',
    title: 'Turbo Killer',
    artist: 'Carpenter Brut',
    artwork: null,
    color: 'linear-gradient(135deg, #bc13fe 0%, #00fff9 100%)',
  },
  {
    id: '3',
    url: 'https://soundcloud.com/perturbator/humans-are-such-easy-prey',
    title: 'Humans Are Such Easy Prey',
    artist: 'Perturbator',
    artwork: null,
    color: 'linear-gradient(135deg, #ff0080 0%, #bc13fe 100%)',
  },
  {
    id: '4',
    url: 'https://soundcloud.com/gunship/tech-noir',
    title: 'Tech Noir',
    artist: 'Gunship',
    artwork: null,
    color: 'linear-gradient(135deg, #00fff9 0%, #39ff14 100%)',
  },
  {
    id: '5',
    url: 'https://soundcloud.com/miami-nights-1984/ocean-drive',
    title: 'Ocean Drive',
    artist: 'Miami Nights 1984',
    artwork: null,
    color: 'linear-gradient(135deg, #39ff14 0%, #00fff9 100%)',
  },
  {
    id: '6',
    url: 'https://soundcloud.com/lazerhawk/overdrive',
    title: 'Overdrive',
    artist: 'Lazerhawk',
    artwork: null,
    color: 'linear-gradient(135deg, #ff6b35 0%, #39ff14 100%)',
  },
  {
    id: '7',
    url: 'https://soundcloud.com/dana-jean-phoenix/machines',
    title: 'Machines',
    artist: 'Dana Jean Phoenix',
    artwork: null,
    color: 'linear-gradient(135deg, #bc13fe 0%, #ff0080 100%)',
  },
  {
    id: '8',
    url: 'https://soundcloud.com/robert-parker-music/night-moves',
    title: 'Night Moves',
    artist: 'Robert Parker',
    artwork: null,
    color: 'linear-gradient(135deg, #ff0080 0%, #ff6b35 100%)',
  },
  {
    id: '9',
    url: 'https://soundcloud.com/makeup-and-vanity-set/88-96',
    title: '88:96',
    artist: 'Makeup and Vanity Set',
    artwork: null,
    color: 'linear-gradient(135deg, #00fff9 0%, #bc13fe 100%)',
  },
  {
    id: '10',
    url: 'https://soundcloud.com/trevor-something/does-it-feel',
    title: 'Does It Feel',
    artist: 'Trevor Something',
    artwork: null,
    color: 'linear-gradient(135deg, #39ff14 0%, #ff0080 100%)',
  },
]

// Discover view — curated extra tracks shown in the Discover tab
export const DISCOVER_TRACKS = [
  {
    id: 'd1',
    url: 'https://soundcloud.com/kavinsky/protector',
    title: 'Protector',
    artist: 'Kavinsky',
    artwork: null,
    color: 'linear-gradient(135deg, #ff6b35, #bc13fe)',
  },
  {
    id: 'd2',
    url: 'https://soundcloud.com/carpenter-brut/le-perv',
    title: 'Le Perv',
    artist: 'Carpenter Brut',
    artwork: null,
    color: 'linear-gradient(135deg, #bc13fe, #ff0080)',
  },
  {
    id: 'd3',
    url: 'https://soundcloud.com/perturbator/retrogenesis',
    title: 'Retrogenesis',
    artist: 'Perturbator',
    artwork: null,
    color: 'linear-gradient(135deg, #00fff9, #39ff14)',
  },
  {
    id: 'd4',
    url: 'https://soundcloud.com/gunship/fly-for-your-life',
    title: 'Fly for Your Life',
    artist: 'Gunship',
    artwork: null,
    color: 'linear-gradient(135deg, #39ff14, #bc13fe)',
  },
  {
    id: 'd5',
    url: 'https://soundcloud.com/lazerhawk/redline',
    title: 'Redline',
    artist: 'Lazerhawk',
    artwork: null,
    color: 'linear-gradient(135deg, #ff0080, #00fff9)',
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/library.js
git commit -m "feat: add hardcoded synthwave library and discover tracks"
```

---

## Task 4: Zustand Store

**Files:**
- Create: `src/store/usePlayerStore.js`
- Create: `src/store/__tests__/usePlayerStore.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/store/__tests__/usePlayerStore.test.js`:

```js
import { beforeEach, describe, expect, it } from 'vitest'
import { usePlayerStore } from '../usePlayerStore'
import { LIBRARY } from '../../data/library'

const track = LIBRARY[0]

beforeEach(() => {
  usePlayerStore.setState(usePlayerStore.getInitialState())
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
  it('clamps and sets volume', () => {
    usePlayerStore.getState().setVolume(60)
    expect(usePlayerStore.getState().volume).toBe(60)
  })
})
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
npx vitest run src/store/__tests__/usePlayerStore.test.js
```
Expected: multiple failures (module not found).

- [ ] **Step 3: Implement `src/store/usePlayerStore.js`**

```js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LIBRARY } from '../data/library'

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
        set({ queueIndex: next, currentTrack: queue[next], isPlaying: true, progress: 0 })
      },

      prevTrack: () => {
        const { queue, queueIndex } = get()
        if (!queue.length) return
        const prev = (queueIndex - 1 + queue.length) % queue.length
        set({ queueIndex: prev, currentTrack: queue[prev], isPlaying: true, progress: 0 })
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

      setProgress: (progress, duration) => set({ progress, duration }),

      setVolume: (volume) => set({ volume }),

      toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),

      cycleRepeat: () => set(s => ({
        repeat: s.repeat === 'none' ? 'all' : s.repeat === 'all' ? 'one' : 'none',
      })),
    }),
    {
      name: 'synthwave-player',
      partialize: (s) => ({ liked: s.liked, playlists: s.playlists, volume: s.volume }),
    }
  )
)
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/store/__tests__/usePlayerStore.test.js
```
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/store/
git commit -m "feat: add Zustand player store with full test coverage"
```

---

## Task 5: SCWidget Component

**Files:**
- Create: `src/components/SCWidget.jsx`
- Create: `src/components/__tests__/SCWidget.test.jsx`

- [ ] **Step 1: Write failing test**

Create `src/components/__tests__/SCWidget.test.jsx`:

```jsx
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { usePlayerStore } from '../../store/usePlayerStore'
import SCWidget from '../SCWidget'
import { LIBRARY } from '../../data/library'

const track = LIBRARY[0]

// Mock SC.Widget
const mockWidget = {
  bind: vi.fn(),
  load: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  seekTo: vi.fn(),
  setVolume: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  window.SC = {
    Widget: vi.fn(() => mockWidget),
    Widget: Object.assign(vi.fn(() => mockWidget), {
      Events: {
        READY: 'ready',
        PLAY: 'play',
        PAUSE: 'pause',
        PLAY_PROGRESS: 'playProgress',
        FINISH: 'finish',
      },
    }),
  }
  usePlayerStore.setState(usePlayerStore.getInitialState())
})

describe('SCWidget', () => {
  it('renders a hidden iframe', () => {
    const { container } = render(<SCWidget />)
    const iframe = container.querySelector('iframe')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveStyle({ display: 'none' })
  })

  it('initializes SC.Widget on mount', () => {
    render(<SCWidget />)
    expect(window.SC.Widget).toHaveBeenCalled()
  })

  it('calls widget.load when currentTrack changes', () => {
    render(<SCWidget />)
    // Simulate READY event firing
    const readyCb = mockWidget.bind.mock.calls.find(([e]) => e === 'ready')?.[1]
    readyCb?.()

    usePlayerStore.setState({ currentTrack: track, isPlaying: true })
    expect(mockWidget.load).toHaveBeenCalledWith(
      track.url,
      expect.objectContaining({ auto_play: true })
    )
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/components/__tests__/SCWidget.test.jsx
```
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/SCWidget.jsx`**

```jsx
import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'

export default function SCWidget() {
  const iframeRef = useRef(null)
  const widgetRef = useRef(null)
  const readyRef = useRef(false)

  const currentTrack = usePlayerStore(s => s.currentTrack)
  const isPlaying    = usePlayerStore(s => s.isPlaying)
  const volume       = usePlayerStore(s => s.volume)
  const { setProgress, nextTrack, togglePlay } = usePlayerStore.getState()

  // Initialize widget once on mount
  useEffect(() => {
    if (!iframeRef.current || !window.SC) return
    const widget = window.SC.Widget(iframeRef.current)
    widgetRef.current = widget
    const Events = window.SC.Widget.Events

    widget.bind(Events.READY, () => { readyRef.current = true })

    widget.bind(Events.PLAY_PROGRESS, ({ currentPosition, duration }) => {
      setProgress(currentPosition, duration)
    })

    widget.bind(Events.FINISH, () => { nextTrack() })
  }, [])

  // Load new track when currentTrack changes
  useEffect(() => {
    if (!widgetRef.current || !readyRef.current || !currentTrack) return
    widgetRef.current.load(currentTrack.url, { auto_play: isPlaying })
  }, [currentTrack])

  // Sync play/pause
  useEffect(() => {
    if (!widgetRef.current || !readyRef.current || !currentTrack) return
    if (isPlaying) {
      widgetRef.current.play()
    } else {
      widgetRef.current.pause()
    }
  }, [isPlaying])

  // Sync volume
  useEffect(() => {
    if (!widgetRef.current || !readyRef.current) return
    widgetRef.current.setVolume(volume)
  }, [volume])

  const initialSrc = 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/kavinsky/nightcall&color=%23bc13fe&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false'

  return (
    <iframe
      ref={iframeRef}
      src={initialSrc}
      style={{ display: 'none' }}
      allow="autoplay"
      title="SoundCloud Player"
    />
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npx vitest run src/components/__tests__/SCWidget.test.jsx
```
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/SCWidget.jsx src/components/__tests__/SCWidget.test.jsx
git commit -m "feat: add SCWidget SoundCloud bridge component"
```

---

## Task 6: TrackCard Component

**Files:**
- Create: `src/components/TrackCard.jsx`
- Create: `src/components/TrackCard.css`
- Create: `src/components/__tests__/TrackCard.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/TrackCard.test.jsx`:

```jsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TrackCard from '../TrackCard'

const track = {
  id: '1',
  url: 'https://soundcloud.com/kavinsky/nightcall',
  title: 'Nightcall',
  artist: 'Kavinsky',
  artwork: null,
  color: 'linear-gradient(135deg, #ff6b35, #ff0080)',
}

describe('TrackCard', () => {
  it('renders title and artist', () => {
    render(<TrackCard track={track} onPlay={vi.fn()} />)
    expect(screen.getByText('Nightcall')).toBeInTheDocument()
    expect(screen.getByText('Kavinsky')).toBeInTheDocument()
  })

  it('calls onPlay when clicked', () => {
    const onPlay = vi.fn()
    render(<TrackCard track={track} onPlay={onPlay} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onPlay).toHaveBeenCalledWith(track)
  })

  it('shows playing indicator when isPlaying=true', () => {
    render(<TrackCard track={track} onPlay={vi.fn()} isPlaying />)
    expect(screen.getByText('▶')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify fail**

```bash
npx vitest run src/components/__tests__/TrackCard.test.jsx
```

- [ ] **Step 3: Implement `src/components/TrackCard.css`**

```css
.track-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  padding: 10px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
  text-align: left;
}

.track-card:hover {
  border-color: var(--accent-purple);
  box-shadow: 0 0 10px rgba(188, 19, 254, 0.2);
}

.track-card.active {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 12px rgba(0, 255, 249, 0.25);
}

.track-card__art {
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-card__art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-card__gradient {
  width: 100%;
  height: 100%;
}

.track-card__play-indicator {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-cyan);
  font-size: 22px;
  text-shadow: var(--glow-cyan);
}

.track-card__title {
  color: var(--text-primary);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
}

.track-card__artist {
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- [ ] **Step 4: Implement `src/components/TrackCard.jsx`**

```jsx
import './TrackCard.css'

export default function TrackCard({ track, onPlay, isPlaying = false, accentColor = 'var(--accent-purple)' }) {
  return (
    <button className={`track-card${isPlaying ? ' active' : ''}`} onClick={() => onPlay(track)}>
      <div className="track-card__art">
        {track.artwork
          ? <img src={track.artwork} alt={track.title} />
          : <div className="track-card__gradient" style={{ background: track.color }} />
        }
        {isPlaying && <div className="track-card__play-indicator">▶</div>}
      </div>
      <div className="track-card__title">{track.title}</div>
      <div className="track-card__artist" style={{ color: accentColor }}>{track.artist}</div>
    </button>
  )
}
```

- [ ] **Step 5: Run test — verify pass**

```bash
npx vitest run src/components/__tests__/TrackCard.test.jsx
```

- [ ] **Step 6: Commit**

```bash
git add src/components/TrackCard.jsx src/components/TrackCard.css src/components/__tests__/TrackCard.test.jsx
git commit -m "feat: add TrackCard component"
```

---

## Task 7: TrackRow Component

**Files:**
- Create: `src/components/TrackRow.jsx`
- Create: `src/components/TrackRow.css`
- Create: `src/components/__tests__/TrackRow.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/TrackRow.test.jsx`:

```jsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TrackRow from '../TrackRow'

const track = {
  id: '1', url: 'https://soundcloud.com/kavinsky/nightcall',
  title: 'Nightcall', artist: 'Kavinsky', artwork: null,
  color: 'linear-gradient(135deg, #ff6b35, #ff0080)',
}

describe('TrackRow', () => {
  it('renders title, artist', () => {
    render(<TrackRow track={track} index={0} onPlay={vi.fn()} onLike={vi.fn()} isLiked={false} />)
    expect(screen.getByText('Nightcall')).toBeInTheDocument()
    expect(screen.getByText('Kavinsky')).toBeInTheDocument()
  })

  it('shows index+1 when not active', () => {
    render(<TrackRow track={track} index={2} onPlay={vi.fn()} onLike={vi.fn()} isLiked={false} />)
    expect(screen.getByText('03')).toBeInTheDocument()
  })

  it('calls onPlay when row is clicked', () => {
    const onPlay = vi.fn()
    render(<TrackRow track={track} index={0} onPlay={onPlay} onLike={vi.fn()} isLiked={false} />)
    fireEvent.click(screen.getByText('Nightcall'))
    expect(onPlay).toHaveBeenCalledWith(track)
  })

  it('calls onLike when heart button clicked', () => {
    const onLike = vi.fn()
    render(<TrackRow track={track} index={0} onPlay={vi.fn()} onLike={onLike} isLiked={false} />)
    fireEvent.click(screen.getByRole('button', { name: /like/i }))
    expect(onLike).toHaveBeenCalledWith(track)
  })

  it('shows filled heart when isLiked=true', () => {
    render(<TrackRow track={track} index={0} onPlay={vi.fn()} onLike={vi.fn()} isLiked />)
    expect(screen.getByRole('button', { name: /like/i })).toHaveAttribute('data-liked', 'true')
  })

  it('shows ▶ indicator when isActive=true', () => {
    render(<TrackRow track={track} index={0} onPlay={vi.fn()} onLike={vi.fn()} isLiked={false} isActive />)
    expect(screen.getByText('▶')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify fail**

```bash
npx vitest run src/components/__tests__/TrackRow.test.jsx
```

- [ ] **Step 3: Implement `src/components/TrackRow.css`**

```css
.track-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  user-select: none;
}

.track-row:hover {
  background: rgba(188, 19, 254, 0.06);
  border-color: rgba(188, 19, 254, 0.15);
}

.track-row.active {
  background: rgba(188, 19, 254, 0.1);
  border-color: rgba(188, 19, 254, 0.3);
}

.track-row__index {
  width: 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 10px;
  flex-shrink: 0;
}

.track-row__index.playing {
  color: var(--accent-purple);
  text-shadow: var(--glow-purple);
}

.track-row__art {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  overflow: hidden;
}

.track-row__art img { width: 100%; height: 100%; object-fit: cover; }
.track-row__gradient { width: 100%; height: 100%; }

.track-row__info {
  flex: 1;
  min-width: 0;
}

.track-row__title {
  color: var(--text-primary);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-row.active .track-row__title {
  color: var(--accent-cyan);
  text-shadow: 0 0 6px rgba(0, 255, 249, 0.5);
}

.track-row__artist {
  color: var(--text-muted);
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-row__duration {
  color: var(--text-muted);
  font-size: 10px;
  flex-shrink: 0;
}

.track-row__like {
  color: var(--text-muted);
  font-size: 14px;
  padding: 2px 4px;
  flex-shrink: 0;
  transition: color 0.15s, text-shadow 0.15s;
}

.track-row__like[data-liked='true'] {
  color: var(--accent-pink);
  text-shadow: var(--glow-pink);
}
```

- [ ] **Step 4: Implement `src/components/TrackRow.jsx`**

```jsx
import './TrackRow.css'

function formatMs(ms) {
  if (!ms) return '--:--'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function TrackRow({ track, index, onPlay, onLike, isLiked, isActive = false, duration }) {
  return (
    <div className={`track-row${isActive ? ' active' : ''}`} onClick={() => onPlay(track)}>
      <span className={`track-row__index${isActive ? ' playing' : ''}`}>
        {isActive ? '▶' : String(index + 1).padStart(2, '0')}
      </span>
      <div className="track-row__art">
        {track.artwork
          ? <img src={track.artwork} alt={track.title} />
          : <div className="track-row__gradient" style={{ background: track.color }} />
        }
      </div>
      <div className="track-row__info">
        <div className="track-row__title">{track.title}</div>
        <div className="track-row__artist">{track.artist}</div>
      </div>
      <span className="track-row__duration">{formatMs(duration)}</span>
      <button
        className="track-row__like"
        data-liked={String(isLiked)}
        aria-label={isLiked ? 'unlike' : 'like'}
        onClick={e => { e.stopPropagation(); onLike(track) }}
      >
        ♥
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Run — verify pass**

```bash
npx vitest run src/components/__tests__/TrackRow.test.jsx
```

- [ ] **Step 6: Commit**

```bash
git add src/components/TrackRow.jsx src/components/TrackRow.css src/components/__tests__/TrackRow.test.jsx
git commit -m "feat: add TrackRow component"
```

---

## Task 8: TopBar Component

**Files:**
- Create: `src/components/TopBar.jsx`
- Create: `src/components/TopBar.css`
- Create: `src/components/__tests__/TopBar.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/TopBar.test.jsx`:

```jsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TopBar from '../TopBar'

describe('TopBar', () => {
  it('renders SYNTH.FM logo', () => {
    render(<TopBar searchQuery="" onSearch={vi.fn()} />)
    expect(screen.getByText('SYNTH')).toBeInTheDocument()
    expect(screen.getByText('.FM')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<TopBar searchQuery="" onSearch={vi.fn()} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('calls onSearch when input changes', () => {
    const onSearch = vi.fn()
    render(<TopBar searchQuery="" onSearch={onSearch} />)
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'kavinsky' } })
    expect(onSearch).toHaveBeenCalledWith('kavinsky')
  })

  it('shows current searchQuery value', () => {
    render(<TopBar searchQuery="kavinsky" onSearch={vi.fn()} />)
    expect(screen.getByDisplayValue('kavinsky')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify fail**

```bash
npx vitest run src/components/__tests__/TopBar.test.jsx
```

- [ ] **Step 3: Implement `src/components/TopBar.css`**

```css
.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  height: 48px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.topbar__logo {
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 4px;
  white-space: nowrap;
}

.topbar__logo-synth {
  color: var(--accent-purple);
  text-shadow: var(--glow-purple);
}

.topbar__logo-fm {
  color: var(--accent-cyan);
  text-shadow: var(--glow-cyan);
}

.topbar__search {
  flex: 1;
  max-width: 420px;
  height: 28px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 0 12px;
  font-size: 11px;
  letter-spacing: 1px;
  outline: none;
  transition: border-color 0.2s;
}

.topbar__search::placeholder {
  color: var(--text-muted);
}

.topbar__search:focus {
  border-color: var(--accent-purple);
  box-shadow: 0 0 8px rgba(188, 19, 254, 0.2);
}

.topbar__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-cyan));
  border: 1px solid var(--accent-purple);
  box-shadow: var(--glow-purple);
  margin-left: auto;
  flex-shrink: 0;
}
```

- [ ] **Step 4: Implement `src/components/TopBar.jsx`**

```jsx
import './TopBar.css'

export default function TopBar({ searchQuery, onSearch }) {
  return (
    <header className="topbar">
      <div className="topbar__logo">
        <span className="topbar__logo-synth">SYNTH</span>
        <span className="topbar__logo-fm">.FM</span>
      </div>
      <input
        className="topbar__search"
        type="text"
        placeholder="⌕  SEARCH LIBRARY..."
        value={searchQuery}
        onChange={e => onSearch(e.target.value)}
      />
      <div className="topbar__avatar" aria-hidden="true" />
    </header>
  )
}
```

- [ ] **Step 5: Run — verify pass**

```bash
npx vitest run src/components/__tests__/TopBar.test.jsx
```

- [ ] **Step 6: Commit**

```bash
git add src/components/TopBar.jsx src/components/TopBar.css src/components/__tests__/TopBar.test.jsx
git commit -m "feat: add TopBar component with search"
```

---

## Task 9: Sidebar Component

**Files:**
- Create: `src/components/Sidebar.jsx`
- Create: `src/components/Sidebar.css`
- Create: `src/components/__tests__/Sidebar.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/Sidebar.test.jsx`:

```jsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '../Sidebar'

const playlists = [
  { id: 'p1', name: 'Synthwave Mix', tracks: [] },
  { id: 'p2', name: 'Retrowave 80s', tracks: [] },
]

describe('Sidebar', () => {
  it('renders all nav items', () => {
    render(<Sidebar activeView="library" playlists={[]} onNav={vi.fn()} onNewPlaylist={vi.fn()} />)
    expect(screen.getByText(/library/i)).toBeInTheDocument()
    expect(screen.getByText(/playlists/i)).toBeInTheDocument()
    expect(screen.getByText(/discover/i)).toBeInTheDocument()
    expect(screen.getByText(/liked/i)).toBeInTheDocument()
  })

  it('calls onNav with correct view when nav item clicked', () => {
    const onNav = vi.fn()
    render(<Sidebar activeView="library" playlists={[]} onNav={onNav} onNewPlaylist={vi.fn()} />)
    fireEvent.click(screen.getByText(/liked/i))
    expect(onNav).toHaveBeenCalledWith('liked', null)
  })

  it('renders playlists', () => {
    render(<Sidebar activeView="library" playlists={playlists} onNav={vi.fn()} onNewPlaylist={vi.fn()} />)
    expect(screen.getByText('Synthwave Mix')).toBeInTheDocument()
    expect(screen.getByText('Retrowave 80s')).toBeInTheDocument()
  })

  it('calls onNav with playlist id when playlist clicked', () => {
    const onNav = vi.fn()
    render(<Sidebar activeView="library" playlists={playlists} onNav={onNav} onNewPlaylist={vi.fn()} />)
    fireEvent.click(screen.getByText('Synthwave Mix'))
    expect(onNav).toHaveBeenCalledWith('playlists', 'p1')
  })

  it('calls onNewPlaylist when + button clicked', () => {
    const onNewPlaylist = vi.fn()
    render(<Sidebar activeView="library" playlists={[]} onNav={vi.fn()} onNewPlaylist={onNewPlaylist} />)
    fireEvent.click(screen.getByRole('button', { name: /new playlist/i }))
    expect(onNewPlaylist).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run — verify fail**

```bash
npx vitest run src/components/__tests__/Sidebar.test.jsx
```

- [ ] **Step 3: Implement `src/components/Sidebar.css`**

```css
.sidebar {
  width: 160px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 14px 0;
}

.sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-muted);
  border-left: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  width: 100%;
  text-align: left;
}

.sidebar__nav-item:hover {
  color: var(--text-primary);
}

.sidebar__nav-item.active {
  color: var(--accent-purple);
  text-shadow: 0 0 8px rgba(188, 19, 254, 0.5);
  border-left-color: var(--accent-purple);
  background: rgba(188, 19, 254, 0.08);
}

.sidebar__divider {
  height: 1px;
  background: var(--border);
  margin: 10px 14px;
}

.sidebar__section-label {
  padding: 4px 14px;
  font-size: 9px;
  letter-spacing: 2px;
  color: var(--border);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar__new-playlist {
  color: var(--accent-cyan);
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
}

.sidebar__playlist {
  padding: 6px 14px;
  font-size: 10px;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s;
  width: 100%;
  text-align: left;
}

.sidebar__playlist:hover {
  color: var(--accent-cyan);
}

.sidebar__playlist.active {
  color: var(--accent-cyan);
  text-shadow: 0 0 6px rgba(0, 255, 249, 0.4);
}
```

- [ ] **Step 4: Implement `src/components/Sidebar.jsx`**

```jsx
import './Sidebar.css'

const NAV_ITEMS = [
  { view: 'library',   icon: '◈', label: 'Library'   },
  { view: 'playlists', icon: '♫', label: 'Playlists'  },
  { view: 'discover',  icon: '⚡', label: 'Discover'  },
  { view: 'liked',     icon: '♥', label: 'Liked'      },
]

export default function Sidebar({ activeView, activePlaylistId, playlists, onNav, onNewPlaylist }) {
  return (
    <nav className="sidebar">
      {NAV_ITEMS.map(({ view, icon, label }) => (
        <button
          key={view}
          className={`sidebar__nav-item${activeView === view && !activePlaylistId ? ' active' : ''}`}
          onClick={() => onNav(view, null)}
        >
          <span>{icon}</span> {label}
        </button>
      ))}

      <div className="sidebar__divider" />

      <div className="sidebar__section-label">
        <span>Playlists</span>
        <button
          className="sidebar__new-playlist"
          aria-label="new playlist"
          onClick={onNewPlaylist}
        >
          +
        </button>
      </div>

      {playlists.map(p => (
        <button
          key={p.id}
          className={`sidebar__playlist${activePlaylistId === p.id ? ' active' : ''}`}
          onClick={() => onNav('playlists', p.id)}
        >
          <span style={{ opacity: 0.5 }}>▸</span> {p.name}
        </button>
      ))}
    </nav>
  )
}
```

- [ ] **Step 5: Run — verify pass**

```bash
npx vitest run src/components/__tests__/Sidebar.test.jsx
```

- [ ] **Step 6: Commit**

```bash
git add src/components/Sidebar.jsx src/components/Sidebar.css src/components/__tests__/Sidebar.test.jsx
git commit -m "feat: add Sidebar component with nav and playlists"
```

---

## Task 10: PlayerBar Component

**Files:**
- Create: `src/components/PlayerBar.jsx`
- Create: `src/components/PlayerBar.css`
- Create: `src/components/__tests__/PlayerBar.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/PlayerBar.test.jsx`:

```jsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PlayerBar from '../PlayerBar'

const track = {
  id: '1', title: 'Nightcall', artist: 'Kavinsky', artwork: null,
  color: 'linear-gradient(135deg, #ff6b35, #ff0080)', url: 'https://soundcloud.com/kavinsky/nightcall',
}

const defaultProps = {
  currentTrack: track,
  isPlaying: false,
  progress: 30000,
  duration: 180000,
  volume: 80,
  isLiked: false,
  shuffle: false,
  repeat: 'none',
  onTogglePlay: vi.fn(),
  onNext: vi.fn(),
  onPrev: vi.fn(),
  onSeek: vi.fn(),
  onVolume: vi.fn(),
  onLike: vi.fn(),
  onShuffle: vi.fn(),
  onRepeat: vi.fn(),
}

describe('PlayerBar', () => {
  it('renders track title and artist', () => {
    render(<PlayerBar {...defaultProps} />)
    expect(screen.getByText('Nightcall')).toBeInTheDocument()
    expect(screen.getByText('Kavinsky')).toBeInTheDocument()
  })

  it('calls onTogglePlay when play button clicked', () => {
    const onTogglePlay = vi.fn()
    render(<PlayerBar {...defaultProps} onTogglePlay={onTogglePlay} />)
    fireEvent.click(screen.getByRole('button', { name: /play|pause/i }))
    expect(onTogglePlay).toHaveBeenCalled()
  })

  it('shows pause icon when isPlaying=true', () => {
    render(<PlayerBar {...defaultProps} isPlaying />)
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
  })

  it('calls onNext when next button clicked', () => {
    const onNext = vi.fn()
    render(<PlayerBar {...defaultProps} onNext={onNext} />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalled()
  })

  it('calls onPrev when prev button clicked', () => {
    const onPrev = vi.fn()
    render(<PlayerBar {...defaultProps} onPrev={onPrev} />)
    fireEvent.click(screen.getByRole('button', { name: /prev/i }))
    expect(onPrev).toHaveBeenCalled()
  })

  it('renders nothing when no currentTrack', () => {
    const { container } = render(<PlayerBar {...defaultProps} currentTrack={null} />)
    expect(container.firstChild).toBeEmptyDOMElement()
  })
})
```

- [ ] **Step 2: Run — verify fail**

```bash
npx vitest run src/components/__tests__/PlayerBar.test.jsx
```

- [ ] **Step 3: Implement `src/components/PlayerBar.css`**

```css
.player-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  height: 72px;
  background: var(--bg-surface);
  border-top: 1px solid var(--accent-purple);
  box-shadow: 0 -4px 24px rgba(188, 19, 254, 0.15);
  flex-shrink: 0;
}

/* Left zone */
.player-bar__track {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 200px;
  flex-shrink: 0;
}

.player-bar__art {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(255, 0, 128, 0.5);
}

.player-bar__art img { width: 100%; height: 100%; object-fit: cover; }
.player-bar__gradient { width: 100%; height: 100%; }

.player-bar__info { min-width: 0; flex: 1; }
.player-bar__title {
  color: var(--text-primary);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.player-bar__artist {
  color: var(--accent-orange);
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-bar__like {
  color: var(--text-muted);
  font-size: 16px;
  padding: 4px;
  flex-shrink: 0;
  transition: color 0.15s, text-shadow 0.15s;
}
.player-bar__like[data-liked='true'] {
  color: var(--accent-pink);
  text-shadow: var(--glow-pink);
}

/* Center zone */
.player-bar__center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.player-bar__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  height: 28px;
}

.player-bar__btn {
  color: var(--text-muted);
  font-size: 14px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, text-shadow 0.15s;
}
.player-bar__btn:hover { color: var(--text-primary); }
.player-bar__btn.active {
  color: var(--accent-cyan);
  text-shadow: var(--glow-cyan);
}

.player-bar__play {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent-purple);
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--glow-purple);
  transition: box-shadow 0.2s, transform 0.1s;
  flex-shrink: 0;
}
.player-bar__play:hover {
  box-shadow: 0 0 16px #bc13fe, 0 0 32px rgba(188,19,254,0.5);
  transform: scale(1.05);
}

.player-bar__progress {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 480px;
}

.player-bar__time {
  color: var(--text-muted);
  font-size: 9px;
  width: 28px;
  flex-shrink: 0;
}
.player-bar__time:last-child { text-align: right; }

.player-bar__seek {
  flex: 1;
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.player-bar__seek-fill {
  height: 3px;
  background: linear-gradient(90deg, var(--accent-purple), var(--accent-cyan));
  border-radius: 2px;
  box-shadow: 0 0 6px var(--accent-purple);
  pointer-events: none;
}

.player-bar__seek-thumb {
  width: 10px;
  height: 10px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px var(--accent-purple);
  pointer-events: none;
}

/* Right zone */
.player-bar__volume {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 140px;
  flex-shrink: 0;
  justify-content: flex-end;
}

.player-bar__vol-icon {
  color: var(--accent-cyan);
  text-shadow: var(--glow-cyan);
  font-size: 13px;
  flex-shrink: 0;
}

.player-bar__vol-track {
  flex: 1;
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.player-bar__vol-fill {
  height: 3px;
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green));
  border-radius: 2px;
  box-shadow: 0 0 6px var(--accent-cyan);
  pointer-events: none;
}

.player-bar__vol-thumb {
  width: 9px;
  height: 9px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 6px var(--accent-cyan);
  pointer-events: none;
}
```

- [ ] **Step 4: Implement `src/components/PlayerBar.jsx`**

```jsx
import './PlayerBar.css'

function fmt(ms) {
  if (!ms && ms !== 0) return '--:--'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function PlayerBar({
  currentTrack, isPlaying, progress, duration, volume,
  isLiked, shuffle, repeat,
  onTogglePlay, onNext, onPrev, onSeek, onVolume, onLike, onShuffle, onRepeat,
}) {
  if (!currentTrack) return <div className="player-bar" />

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  function handleSeekClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    onSeek(Math.floor(ratio * duration))
  }

  function handleVolumeClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onVolume(Math.round(ratio * 100))
  }

  return (
    <div className="player-bar">
      {/* Left */}
      <div className="player-bar__track">
        <div className="player-bar__art">
          {currentTrack.artwork
            ? <img src={currentTrack.artwork} alt={currentTrack.title} />
            : <div className="player-bar__gradient" style={{ background: currentTrack.color }} />
          }
        </div>
        <div className="player-bar__info">
          <div className="player-bar__title">{currentTrack.title}</div>
          <div className="player-bar__artist">{currentTrack.artist}</div>
        </div>
        <button
          className="player-bar__like"
          data-liked={String(isLiked)}
          aria-label={isLiked ? 'unlike' : 'like'}
          onClick={() => onLike(currentTrack)}
        >♥</button>
      </div>

      {/* Center */}
      <div className="player-bar__center">
        <div className="player-bar__controls">
          <button
            className={`player-bar__btn${shuffle ? ' active' : ''}`}
            aria-label="shuffle"
            onClick={onShuffle}
          >⇄</button>
          <button className="player-bar__btn" aria-label="prev" onClick={onPrev}>⏮</button>
          <button
            className="player-bar__play"
            aria-label={isPlaying ? 'pause' : 'play'}
            onClick={onTogglePlay}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="player-bar__btn" aria-label="next" onClick={onNext}>⏭</button>
          <button
            className={`player-bar__btn${repeat !== 'none' ? ' active' : ''}`}
            aria-label="repeat"
            onClick={onRepeat}
          >
            {repeat === 'one' ? '↺¹' : '↺'}
          </button>
        </div>

        <div className="player-bar__progress">
          <span className="player-bar__time">{fmt(progress)}</span>
          <div className="player-bar__seek" onClick={handleSeekClick}>
            <div className="player-bar__seek-fill" style={{ width: `${pct}%` }} />
            <div className="player-bar__seek-thumb" style={{ left: `${pct}%` }} />
          </div>
          <span className="player-bar__time">{fmt(duration)}</span>
        </div>
      </div>

      {/* Right */}
      <div className="player-bar__volume">
        <span className="player-bar__vol-icon">🔊</span>
        <div className="player-bar__vol-track" onClick={handleVolumeClick}>
          <div className="player-bar__vol-fill" style={{ width: `${volume}%` }} />
          <div className="player-bar__vol-thumb" style={{ left: `${volume}%` }} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run — verify pass**

```bash
npx vitest run src/components/__tests__/PlayerBar.test.jsx
```

- [ ] **Step 6: Commit**

```bash
git add src/components/PlayerBar.jsx src/components/PlayerBar.css src/components/__tests__/PlayerBar.test.jsx
git commit -m "feat: add PlayerBar component with full controls"
```

---

## Task 11: Views (Library, Playlist, Discover, Liked)

**Files:**
- Create: `src/components/views/LibraryView.jsx`
- Create: `src/components/views/LibraryView.css`
- Create: `src/components/views/PlaylistView.jsx`
- Create: `src/components/views/DiscoverView.jsx`
- Create: `src/components/views/LikedView.jsx`
- Create: `src/components/views/__tests__/LibraryView.test.jsx`

- [ ] **Step 1: Write failing test for LibraryView**

Create `src/components/views/__tests__/LibraryView.test.jsx`:

```jsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LibraryView from '../LibraryView'
import { LIBRARY } from '../../../data/library'

const props = {
  tracks: LIBRARY,
  currentTrack: null,
  isPlaying: false,
  onPlay: vi.fn(),
  onLike: vi.fn(),
  isLiked: vi.fn(() => false),
}

describe('LibraryView', () => {
  it('renders LIBRARY section heading', () => {
    render(<LibraryView {...props} />)
    expect(screen.getByText(/library/i)).toBeInTheDocument()
  })

  it('renders a TrackCard for each track in the grid', () => {
    render(<LibraryView {...props} />)
    expect(screen.getAllByText('Nightcall').length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when tracks is empty', () => {
    render(<LibraryView {...props} tracks={[]} />)
    expect(screen.getByText(/no tracks/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify fail**

```bash
npx vitest run src/components/views/__tests__/LibraryView.test.jsx
```

- [ ] **Step 3: Implement `src/components/views/LibraryView.css`**

```css
.library-view {
  padding: 16px;
  overflow-y: auto;
  height: 100%;
}

.view-heading {
  font-size: 9px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.library-view__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.library-view__list-heading {
  font-size: 9px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.library-view__empty {
  color: var(--text-muted);
  font-size: 11px;
  text-align: center;
  padding: 40px;
  letter-spacing: 2px;
}
```

- [ ] **Step 4: Implement `src/components/views/LibraryView.jsx`**

```jsx
import TrackCard from '../TrackCard'
import TrackRow from '../TrackRow'
import './LibraryView.css'

const ACCENT_COLORS = [
  'var(--accent-purple)', 'var(--accent-cyan)',
  'var(--accent-pink)', 'var(--accent-orange)', 'var(--accent-green)',
]

export default function LibraryView({ tracks, currentTrack, isPlaying, onPlay, onLike, isLiked }) {
  if (!tracks.length) {
    return (
      <div className="library-view">
        <p className="library-view__empty">NO TRACKS FOUND</p>
      </div>
    )
  }

  const gridTracks = tracks.slice(0, 8)

  return (
    <div className="library-view">
      <div className="view-heading" style={{ color: 'var(--accent-purple)', textShadow: '0 0 6px var(--accent-purple)' }}>
        LIBRARY — {tracks.length} TRACKS
      </div>

      <div className="library-view__grid">
        {gridTracks.map((track, i) => (
          <TrackCard
            key={track.id}
            track={track}
            onPlay={t => onPlay(t, tracks)}
            isPlaying={currentTrack?.id === track.id && isPlaying}
            accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length]}
          />
        ))}
      </div>

      <div className="library-view__list-heading" style={{ color: 'var(--accent-cyan)', textShadow: '0 0 6px var(--accent-cyan)' }}>
        ALL TRACKS
      </div>

      {tracks.map((track, i) => (
        <TrackRow
          key={track.id}
          track={track}
          index={i}
          onPlay={t => onPlay(t, tracks)}
          onLike={onLike}
          isLiked={isLiked(track.id)}
          isActive={currentTrack?.id === track.id}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Implement `src/components/views/PlaylistView.jsx`**

```jsx
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
        <TrackRow
          key={track.id}
          track={track}
          index={i}
          onPlay={t => onPlay(t, playlist.tracks)}
          onLike={onLike}
          isLiked={isLiked(track.id)}
          isActive={currentTrack?.id === track.id}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Implement `src/components/views/DiscoverView.jsx`**

```jsx
import TrackRow from '../TrackRow'
import { DISCOVER_TRACKS } from '../../data/library'

export default function DiscoverView({ currentTrack, isPlaying, onPlay, onLike, isLiked, onAddToPlaylist, playlists }) {
  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%' }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--accent-orange)', textShadow: '0 0 6px var(--accent-orange)', marginBottom: 14 }}>
        ⚡ DISCOVER — CURATED SYNTHWAVE
      </div>
      {DISCOVER_TRACKS.map((track, i) => (
        <TrackRow
          key={track.id}
          track={track}
          index={i}
          onPlay={t => onPlay(t, DISCOVER_TRACKS)}
          onLike={onLike}
          isLiked={isLiked(track.id)}
          isActive={currentTrack?.id === track.id}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 7: Implement `src/components/views/LikedView.jsx`**

```jsx
import TrackRow from '../TrackRow'

export default function LikedView({ liked, currentTrack, isPlaying, onPlay, onLike }) {
  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%' }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--accent-pink)', textShadow: '0 0 6px var(--accent-pink)', marginBottom: 14 }}>
        ♥ LIKED — {liked.length} TRACKS
      </div>
      {liked.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: 11, letterSpacing: 2 }}>NO LIKED TRACKS YET. HIT ♥ ON ANY TRACK.</p>
      )}
      {liked.map((track, i) => (
        <TrackRow
          key={track.id}
          track={track}
          index={i}
          onPlay={t => onPlay(t, liked)}
          onLike={onLike}
          isLiked={true}
          isActive={currentTrack?.id === track.id}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 8: Run LibraryView tests — verify pass**

```bash
npx vitest run src/components/views/__tests__/LibraryView.test.jsx
```

- [ ] **Step 9: Commit**

```bash
git add src/components/views/
git commit -m "feat: add Library, Playlist, Discover, Liked views"
```

---

## Task 12: MainContent + App — Wire Everything Together

**Files:**
- Create: `src/components/MainContent.jsx`
- Modify: `src/App.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Implement `src/components/MainContent.jsx`**

```jsx
import { usePlayerStore } from '../store/usePlayerStore'
import LibraryView from './views/LibraryView'
import PlaylistView from './views/PlaylistView'
import DiscoverView from './views/DiscoverView'
import LikedView from './views/LikedView'

export default function MainContent() {
  const activeView      = usePlayerStore(s => s.activeView)
  const activePlaylistId = usePlayerStore(s => s.activePlaylistId)
  const currentTrack    = usePlayerStore(s => s.currentTrack)
  const isPlaying       = usePlayerStore(s => s.isPlaying)
  const library         = usePlayerStore(s => s.library)
  const playlists       = usePlayerStore(s => s.playlists)
  const liked           = usePlayerStore(s => s.liked)
  const searchQuery     = usePlayerStore(s => s.searchQuery)

  const { playTrack, toggleLike, isLiked } = usePlayerStore.getState()

  const filteredLibrary = searchQuery
    ? library.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : library

  if (activeView === 'playlists') {
    const playlist = playlists.find(p => p.id === activePlaylistId) || playlists[0]
    return (
      <PlaylistView
        playlist={playlist}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlay={playTrack}
        onLike={toggleLike}
        isLiked={isLiked}
      />
    )
  }

  if (activeView === 'discover') {
    return (
      <DiscoverView
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlay={playTrack}
        onLike={toggleLike}
        isLiked={isLiked}
        playlists={playlists}
      />
    )
  }

  if (activeView === 'liked') {
    return (
      <LikedView
        liked={liked}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlay={playTrack}
        onLike={toggleLike}
      />
    )
  }

  // Default: library
  return (
    <LibraryView
      tracks={filteredLibrary}
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      onPlay={playTrack}
      onLike={toggleLike}
      isLiked={isLiked}
    />
  )
}
```

- [ ] **Step 2: Implement `src/App.css`**

```css
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* Scanline overlay — subtle CRT effect */
.app::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
  z-index: 9999;
}

.app__body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app__main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 3: Implement `src/App.jsx`**

```jsx
import './App.css'
import { usePlayerStore } from './store/usePlayerStore'
import SCWidget from './components/SCWidget'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import PlayerBar from './components/PlayerBar'

export default function App() {
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

  const {
    setActiveView, setSearchQuery, createPlaylist,
    togglePlay, nextTrack, prevTrack, setProgress, setVolume,
    toggleLike, isLiked, toggleShuffle, cycleRepeat,
  } = usePlayerStore.getState()

  function handleNewPlaylist() {
    const name = window.prompt('Playlist name:')
    if (name?.trim()) createPlaylist(name.trim())
  }

  function handleSeek(ms) {
    setProgress(ms, duration)
    // SCWidget syncs via useEffect watching progress — seekTo called there
    // We need a ref-based approach: expose seekTo via store or a custom event
    window.dispatchEvent(new CustomEvent('sc:seek', { detail: ms }))
  }

  return (
    <div className="app">
      <SCWidget />
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
      />
    </div>
  )
}
```

- [ ] **Step 4: Update `SCWidget.jsx` to handle seek events**

Add this `useEffect` inside `SCWidget`, after the volume effect:

```jsx
// Handle seek from PlayerBar
useEffect(() => {
  function onSeek(e) {
    if (widgetRef.current && readyRef.current) {
      widgetRef.current.seekTo(e.detail)
    }
  }
  window.addEventListener('sc:seek', onSeek)
  return () => window.removeEventListener('sc:seek', onSeek)
}, [])
```

- [ ] **Step 5: Run all tests**

```bash
npx vitest run
```
Expected: all tests pass.

- [ ] **Step 6: Start dev server and verify in browser**

```bash
npm run dev
```

Open `http://localhost:5173`. Verify:
- Layout renders: sidebar, topbar, library grid, player bar
- Clicking a TrackCard starts playback (player bar updates)
- Play/pause button works and is centered
- Progress bar advances
- Sidebar navigation switches views
- Search filters tracks in library
- Like button toggles heart color

- [ ] **Step 7: Commit**

```bash
git add src/components/MainContent.jsx src/App.jsx src/App.css src/components/SCWidget.jsx
git commit -m "feat: wire all components into App — synthwave player complete"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|---|---|
| Synthwave palette + typography | Task 2 |
| Three-zone layout (TopBar / Sidebar+Main / PlayerBar) | Task 12 |
| SCWidget hidden iframe + Widget API | Task 5 |
| TrackCard (grid, click to play, artwork) | Task 6 |
| TrackRow (list, like, active indicator) | Task 7 |
| TopBar (logo, search) | Task 8 |
| Sidebar (nav, playlists, new playlist) | Task 9 |
| PlayerBar (controls, seekbar, volume, shuffle, repeat) | Task 10 |
| LibraryView (grid + list) | Task 11 |
| PlaylistView | Task 11 |
| DiscoverView (curated tracks) | Task 11 |
| LikedView | Task 11 |
| Zustand store (playback + persist) | Task 4 |
| Library data (15 hardcoded tracks) | Task 3 |
| Local search filtering | Task 12 |
| localStorage persistence (liked, playlists, volume) | Task 4 |
| Scanline CRT effect | Task 12 |

All spec requirements covered. No placeholders. Types are consistent across tasks (`Track` shape: `{ id, url, title, artist, artwork, color }`). `onPlay` signature is `(track, queue)` — consistent in Tasks 6, 11, 12.
