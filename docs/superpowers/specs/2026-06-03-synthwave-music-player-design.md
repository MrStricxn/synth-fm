# Synthwave Music Player — Design Spec

**Date:** 2026-06-03  
**Stack:** Vite + React + SoundCloud Widget API  
**Style:** Retro / Synthwave

---

## Overview

A full-featured single-page music player web app with a retro synthwave aesthetic. Users can browse a library of tracks sourced from SoundCloud, create playlists, like tracks, and search for new music. Playback is handled via the SoundCloud Widget API (hidden iframe), with a fully custom UI built in React.

---

## Visual Design

**Palette:**
- Background: `#0a0a0f` (deep dark blue-black)
- Surface: `#06060e`, `#0d0d1a`
- Border/divider: `#1a1a2e`
- Primary accent: `#bc13fe` (neon purple)
- Secondary accent: `#00fff9` (cyan)
- Tertiary: `#ff0080` (hot pink), `#ff6b35` (orange), `#39ff14` (neon green)
- Text primary: `#ffffff`
- Text muted: `#6a6a8a`

**Typography:** `'Courier New', monospace` throughout — reinforces the retro terminal aesthetic.

**Effects:** Neon glow via `text-shadow` and `box-shadow` on accent elements. Scanline overlay using `repeating-linear-gradient` on key panels. Progress bars use gradient fills (`purple → cyan`, `cyan → green`).

---

## Layout

Three-zone layout, always visible:

```
┌─────────────────────────────────────────┐
│  TopBar: Logo | Search                  │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │  MainContent (routed view)   │
│          │                              │
├──────────┴──────────────────────────────┤
│  PlayerBar (always visible)             │
└─────────────────────────────────────────┘
```

---

## Components

### `App`
Root component. Renders `TopBar`, `Sidebar`, `MainContent`, `PlayerBar`, and the hidden `SCWidget` iframe. Wraps everything in the Zustand store provider.

### `TopBar`
- Logo: `SYNTH.FM` with split neon color (purple + cyan)
- Search input: triggers `DiscoverView` with results on submit
- User avatar placeholder (right side)

### `Sidebar`
Navigation links (Library, Playlists, Discover, Liked) — each changes the active view in `MainContent`. Below the nav: list of user-created playlists, each clickable to open `PlaylistView`.

### `MainContent`
Switches between views based on active route/state:

- **LibraryView** — default view. Top section: 4-column album art grid (click to play). Bottom section: full track list with artwork, title, artist, duration, like button.
- **PlaylistView** — same track list format, filtered to a single playlist.
- **DiscoverView** — search results from SoundCloud. Same track list format with an "Add to playlist" option.
- **LikedView** — liked tracks, same format.

### `TrackCard`
Used in the album grid. Shows: gradient album art (or SoundCloud artwork), track title, artist name. Click plays the track immediately.

### `TrackRow`
Used in list views. Shows: play indicator / track number, artwork thumbnail, title + artist, duration, like button. Highlight on currently playing track.

### `PlayerBar`
Fixed to the bottom. Three zones:

- **Left** — current track art, title, artist, like button
- **Center** — transport controls (shuffle, prev, play/pause, next, repeat) + seekable progress bar with timestamps
- **Right** — volume icon + volume slider

Play button: circular, neon purple glow, perfectly centered with flexbox.

### `SCWidget`
A visually hidden `<iframe>` with a SoundCloud embed URL. Initialized once on mount via `SC.Widget(iframe)`. Exposes `play()`, `pause()`, `seekTo(ms)`, `setVolume(0-100)`, `skip(index)`. Fires events (`PLAY_PROGRESS`, `FINISH`, `READY`) that update Zustand state.

---

## State (Zustand)

```js
{
  // Playback
  currentTrack: { url, title, artist, artwork, duration } | null,
  isPlaying: false,
  progress: 0,        // ms
  duration: 0,        // ms
  volume: 80,         // 0-100

  // Queue
  queue: Track[],
  queueIndex: 0,
  shuffle: false,
  repeat: false,      // 'none' | 'one' | 'all'

  // Library
  library: Track[],   // hardcoded initial tracks + discovered

  // User data (persisted to localStorage)
  playlists: [{ id, name, tracks: Track[] }],
  liked: Track[],

  // UI
  activeView: 'library' | 'playlists' | 'discover' | 'liked',
  activePlaylistId: string | null,
  searchQuery: string,
}
```

---

## Data

### Initial Library
~10 hardcoded SoundCloud track URLs embedded in `src/data/library.js`. Tracks chosen from the synthwave/retrowave genre (Kavinsky, Carpenter Brut, Miami Nights 1984, etc.).

### SoundCloud Widget API Flow
1. `SCWidget` iframe loads with the first track URL on mount.
2. On `READY` event: widget is controllable.
3. On track change: call `widget.load(url, { auto_play: true })`.
4. On `PLAY_PROGRESS`: update `progress` in store every 500ms.
5. On `FINISH`: auto-advance queue (respecting shuffle/repeat).

### Search (DiscoverView)
SoundCloud's HTTP search API requires a registered `client_id` (approval often denied). To avoid this dependency, `DiscoverView` will instead show a curated list of ~30 additional hardcoded SoundCloud tracks across synthwave sub-genres (darksynth, outrun, retrowave).

The search bar in `TopBar` performs **local filtering** of the library by title and artist name — no external API call needed. This keeps the app fully self-contained and eliminates the SoundCloud API approval risk entirely.

### Persistence
`playlists` and `liked` arrays are synced to `localStorage` via a Zustand middleware (`persist`).

---

## File Structure

```
src/
├── components/
│   ├── TopBar.jsx
│   ├── Sidebar.jsx
│   ├── MainContent.jsx
│   ├── views/
│   │   ├── LibraryView.jsx
│   │   ├── PlaylistView.jsx
│   │   ├── DiscoverView.jsx
│   │   └── LikedView.jsx
│   ├── TrackCard.jsx
│   ├── TrackRow.jsx
│   ├── PlayerBar.jsx
│   └── SCWidget.jsx
├── store/
│   └── usePlayerStore.js   # Zustand store
├── data/
│   └── library.js          # hardcoded initial tracks
├── styles/
│   └── globals.css         # CSS variables + reset
├── App.jsx
└── main.jsx
```

---

## Out of Scope

- User authentication / accounts
- Backend / server
- Mobile native app
- Offline playback / PWA
- Waveform visualization (can be added later)
- SoundCloud OAuth (no user login required)
