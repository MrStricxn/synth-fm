# Yandex.Music Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Yandex.Music as the playback source (search, charts, seed, streaming) and temporarily route the player to it only, leaving Audius/hearthis code intact for a one-flag revert.

**Architecture:** A local `cors-anywhere` proxy strips CORS from `api.music.yandex.net` JSON calls. All Yandex logic lives in the frontend (`src/api/yandex.js`): search/chart/seed return normalized tracks; the direct MP3 URL is computed lazily at play time via a Yandex `download-info` round-trip plus an MD5 signature. `usePlayerStore.js` branches on a `SOURCE` flag; `AudioEngine.jsx` resolves the Yandex stream URL just before playback. The native `<audio>` engine is otherwise unchanged.

**Tech Stack:** Vite + React 19 + Zustand, Vitest, `js-md5` (new dep), `cors-anywhere` (new dev dep, vendored as `server/cors-proxy.js`).

---

## File Structure

- Create: `server/cors-proxy.js` — local CORS proxy (vendored from `acherkashin/yandex-music-cors-proxy`).
- Create: `.env.example` — committed template for `VITE_YANDEX_TOKEN` / `VITE_YANDEX_PROXY` / `VITE_PLAYER_SOURCE`.
- Create: `.env.local` — real token (NOT committed; covered by `*.local` in `.gitignore`).
- Create: `src/api/yandex.js` — Yandex client: config, `normalizeTrack`, `buildSignedUrl`, `getStreamUrl`, `searchTracks`, `trendingTracks`, `resolveSeed`.
- Create: `src/api/__tests__/yandex.test.js` — unit tests for `normalizeTrack` + `buildSignedUrl`.
- Modify: `package.json` — add deps + `proxy` script.
- Modify: `src/store/usePlayerStore.js` — `SOURCE` flag + Yandex branches in `loadCatalogue` / `setSearchQuery` / `loadRecommendations`.
- Modify: `src/components/AudioEngine.jsx:17-26` — lazy Yandex stream resolution in the load effect.

---

## Task 1: Dependencies, env, and local proxy

**Files:**
- Modify: `package.json`
- Create: `server/cors-proxy.js`
- Create: `.env.example`
- Create: `.env.local`

- [ ] **Step 1: Install dependencies**

Run:
```bash
npm install js-md5
npm install -D cors-anywhere
```
Expected: both added to `package.json`, no errors.

- [ ] **Step 2: Add the `proxy` script to `package.json`**

In the `"scripts"` block, add a `proxy` entry so the section reads:
```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "coverage": "vitest run --coverage",
    "proxy": "node server/cors-proxy.cjs"
  },
```

(The file is created as `.cjs` in Step 3 — see the note there about `"type": "module"`.)

- [ ] **Step 3: Create the local CORS proxy** `server/cors-proxy.js`

```js
// Local CORS proxy for Yandex.Music JSON calls — vendored from
// acherkashin/yandex-music-cors-proxy (thin cors-anywhere wrapper).
// Run with `npm run proxy`. Keeps the OAuth token on YOUR machine: requests
// transit localhost, not a third-party host.
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 8080

const corsProxy = require('cors-anywhere')
corsProxy
  .createServer({
    originWhitelist: [], // allow all local origins
    httpProxyOptions: {
      // Yandex rejects requests with forwarded-for headers ("400 Contradictory
      // sheme headers"), so disable xfwd.
      xfwd: false,
    },
  })
  .listen(port, host, () => {
    console.log(`CORS proxy on ${host}:${port}`)
  })
```

Note: `server/cors-proxy.js` uses CommonJS `require`. The project is `"type": "module"`, so a bare `.js` is treated as ESM. Use the `.cjs` extension instead to force CommonJS.

Therefore create the file as `server/cors-proxy.cjs` (same contents) and set the script to `"proxy": "node server/cors-proxy.cjs"`.

- [ ] **Step 4: Create `.env.example` (committed template)**

```
# Yandex.Music OAuth token. Get it by opening this URL, logging in, and copying
# the access_token from the redirected address bar (#access_token=...):
# https://oauth.yandex.ru/authorize?response_type=token&client_id=23cabbbdc6cd418abb4b39c32c41195d
VITE_YANDEX_TOKEN=

# CORS proxy base (local by default — run `npm run proxy`).
VITE_YANDEX_PROXY=http://localhost:8080

# Player source: 'yandex' routes the app to Yandex only. Set to 'multi' to
# restore Audius + hearthis.
VITE_PLAYER_SOURCE=yandex
```

- [ ] **Step 5: Create `.env.local` (NOT committed)**

```
VITE_YANDEX_TOKEN=<paste the real token here>
VITE_YANDEX_PROXY=http://localhost:8080
VITE_PLAYER_SOURCE=yandex
```

Verify it is ignored:
```bash
git check-ignore .env.local
```
Expected: prints `.env.local` (it is ignored via the `*.local` rule). If it prints nothing, STOP and add `.env.local` to `.gitignore` before continuing.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json server/cors-proxy.cjs .env.example
git commit -m "chore: add js-md5, cors-anywhere proxy, and Yandex env template"
```
(Do NOT `git add .env.local`.)

---

## Task 2: Yandex client — config + `normalizeTrack`

**Files:**
- Create: `src/api/yandex.js`
- Test: `src/api/__tests__/yandex.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/api/__tests__/yandex.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { normalizeTrack } from '../yandex'

describe('yandex normalizeTrack', () => {
  const raw = {
    id: 12345,
    title: 'Lazerhawk',
    artists: [{ name: 'Lazerhawk' }, { name: 'Guest' }],
    durationMs: 215000,
    coverUri: 'avatars.yandex.net/get-music-content/abc/%%',
  }

  it('maps Yandex fields to the shared track shape', () => {
    const t = normalizeTrack(raw)
    expect(t.id).toBe('ya_12345')
    expect(t.trackId).toBe('12345')
    expect(t.title).toBe('Lazerhawk')
    expect(t.artist).toBe('Lazerhawk') // first artist
    expect(t.duration).toBe(215000)    // durationMs passthrough (ms)
    expect(t.source).toBe('yandex')
    expect(t.streamUrl).toBe('')       // resolved lazily at play time
  })

  it('expands the %% cover template to a 400x400 https URL', () => {
    const t = normalizeTrack(raw)
    expect(t.artwork).toBe('https://avatars.yandex.net/get-music-content/abc/400x400')
  })

  it('falls back gracefully when fields are missing', () => {
    const t = normalizeTrack({ id: 9 })
    expect(t.id).toBe('ya_9')
    expect(t.title).toBe('Untitled')
    expect(t.artist).toBe('Unknown')
    expect(t.duration).toBe(0)
    expect(t.artwork).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/api/__tests__/yandex.test.js`
Expected: FAIL — cannot import `normalizeTrack` (module/file does not exist).

- [ ] **Step 3: Write minimal implementation**

Create `src/api/yandex.js`:
```js
// Yandex.Music client. The official API has no CORS and needs an OAuth token,
// so JSON calls go through a local cors-anywhere proxy (see server/cors-proxy.cjs)
// with `Authorization: OAuth <token>`. The final MP3 is a signed storage URL
// played directly by the native <audio> engine (no token, no proxy) — see
// getStreamUrl / buildSignedUrl below.
import { colorFor } from './audius'

const TOKEN = import.meta.env.VITE_YANDEX_TOKEN || ''
const PROXY = (import.meta.env.VITE_YANDEX_PROXY || 'http://localhost:8080').replace(/\/$/, '')
const API = 'https://api.music.yandex.net'

// avatars.yandex.net cover URIs end in `%%` — substitute a concrete size.
function coverUrl(uri, size = '400x400') {
  if (!uri) return ''
  return `https://${uri.replace('%%', size)}`
}

// Yandex track → the shape the rest of the app already expects. streamUrl is
// resolved lazily (getStreamUrl) because it costs an extra round-trip per track.
export function normalizeTrack(t) {
  const id = String(t.id)
  return {
    id: `ya_${id}`,
    trackId: id,
    title: t.title || 'Untitled',
    artist: t.artists?.[0]?.name || 'Unknown',
    artwork: coverUrl(t.coverUri),
    streamUrl: '',
    duration: t.durationMs || 0, // already ms
    genre: '',
    playCount: 0,
    color: colorFor(`ya_${id}`),
    source: 'yandex',
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/api/__tests__/yandex.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/api/yandex.js src/api/__tests__/yandex.test.js
git commit -m "feat(yandex): normalizeTrack + client config"
```

---

## Task 3: Signed stream URL (`buildSignedUrl`)

**Files:**
- Modify: `src/api/yandex.js`
- Test: `src/api/__tests__/yandex.test.js`

- [ ] **Step 1: Write the failing test**

Append to `src/api/__tests__/yandex.test.js`:
```js
import md5 from 'js-md5'
import { buildSignedUrl, SIGN_SALT } from '../yandex'

describe('yandex buildSignedUrl', () => {
  const info = { host: 's1.storage.mds.yandex.net', path: '/get-mp3/abc/123/file.mp3', ts: '1700000000', s: 'deadbeef' }

  it('proves the md5 dependency works (known vector)', () => {
    expect(md5('abc')).toBe('900150983cd24fb0d6963f7d28e17f72')
  })

  it('signs with salt + path-without-leading-slash + s, in the get-mp3 layout', () => {
    const calls = []
    const fakeMd5 = (input) => { calls.push(input); return 'SIGN' }
    const url = buildSignedUrl(info, fakeMd5)
    expect(calls[0]).toBe(`${SIGN_SALT}get-mp3/abc/123/file.mp3deadbeef`)
    expect(url).toBe('https://s1.storage.mds.yandex.net/get-mp3/SIGN/1700000000/get-mp3/abc/123/file.mp3')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/api/__tests__/yandex.test.js -t buildSignedUrl`
Expected: FAIL — `buildSignedUrl`/`SIGN_SALT` not exported.

- [ ] **Step 3: Write minimal implementation**

Add to `src/api/yandex.js` (below `normalizeTrack`, and add the import at the top):
```js
import md5 from 'js-md5'
```
```js
// Salt used by Yandex to sign direct-download URLs (stable, widely documented).
export const SIGN_SALT = 'XGRlBW9FXlekgbPrRHuSiA'

// Given the JSON download descriptor {host, path, ts, s}, compute the signed
// MP3 URL. md5 is injectable for testing; defaults to js-md5.
export function buildSignedUrl({ host, path, ts, s }, md5fn = md5) {
  const sign = md5fn(SIGN_SALT + path.replace(/^\//, '') + s)
  return `https://${host}/get-mp3/${sign}/${ts}${path}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/api/__tests__/yandex.test.js`
Expected: PASS (all tests, including the two new ones).

- [ ] **Step 5: Commit**

```bash
git add src/api/yandex.js src/api/__tests__/yandex.test.js
git commit -m "feat(yandex): signed stream URL builder"
```

---

## Task 4: Network calls — `getStreamUrl`, `searchTracks`, `trendingTracks`, `resolveSeed`

**Files:**
- Modify: `src/api/yandex.js`

These are thin network functions verified manually in Task 7 (they need a live token/proxy). No new unit tests — pure logic is already covered by Tasks 2–3.

- [ ] **Step 1: Add the proxied fetch helper + endpoints**

Add to `src/api/yandex.js`:
```js
// All JSON requests go through the CORS proxy with the OAuth header. The proxy
// expects the target URL appended verbatim: `${PROXY}/${API}/<endpoint>`.
async function apiGet(endpoint) {
  const res = await fetch(`${PROXY}/${API}${endpoint}`, {
    headers: { Authorization: `OAuth ${TOKEN}`, 'X-Requested-With': 'XMLHttpRequest' },
  })
  if (res.status === 401) throw new Error('Yandex 401 — токен протух/не задан (VITE_YANDEX_TOKEN)')
  if (!res.ok) throw new Error(`Yandex ${endpoint} → ${res.status}`)
  const json = await res.json()
  return json.result
}

// Resolve a track id to a playable MP3 URL (two round-trips + signature).
export async function getStreamUrl(trackId) {
  const variants = await apiGet(`/tracks/${trackId}/download-info`)
  const mp3s = (variants || []).filter(v => v.codec === 'mp3')
  if (!mp3s.length) throw new Error(`no mp3 variant for track ${trackId}`)
  mp3s.sort((a, b) => (b.bitrateInKbps || 0) - (a.bitrateInKbps || 0))
  // downloadInfoUrl returns XML by default; &format=json gives {host,path,ts,s}.
  const res = await fetch(`${PROXY}/${mp3s[0].downloadInfoUrl}&format=json`, {
    headers: { Authorization: `OAuth ${TOKEN}`, 'X-Requested-With': 'XMLHttpRequest' },
  })
  if (!res.ok) throw new Error(`Yandex download-info → ${res.status}`)
  const info = await res.json()
  return buildSignedUrl(info)
}

export async function searchTracks(query, limit = 20) {
  const result = await apiGet(`/search?text=${encodeURIComponent(query)}&type=track&page=0&nocorrect=false`)
  const items = result?.tracks?.results || []
  return items.slice(0, limit).map(normalizeTrack)
}

// Chart feed. result.chart.tracks is an array of chart items, each wrapping a
// track under `.track` (older payloads put the track inline) — handle both.
export async function trendingTracks(limit = 40) {
  const result = await apiGet('/landing3/chart')
  const items = result?.chart?.tracks || result?.tracks || []
  return items.map(x => normalizeTrack(x.track || x)).slice(0, limit)
}

// Run async fn over items with limited concurrency.
async function mapLimit(items, limit, fn) {
  const out = []
  let i = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++
      try { out[idx] = await fn(items[idx]) } catch { out[idx] = [] }
    }
  })
  await Promise.all(workers)
  return out
}

// Resolve seed artist names to a few tracks each (deduped), like the other sources.
export async function resolveSeed(terms, perTerm = 2) {
  const results = await mapLimit(terms, 5, q => searchTracks(q, perTerm))
  const seen = new Set()
  const out = []
  for (const list of results) {
    for (const t of (list || [])) {
      if (seen.has(t.id)) continue
      seen.add(t.id)
      out.push(t)
    }
  }
  return out
}
```

- [ ] **Step 2: Verify the module still imports cleanly**

Run: `npx vitest run src/api/__tests__/yandex.test.js`
Expected: PASS (existing tests still green; new functions are not unit-tested here).

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors in `src/api/yandex.js`.

- [ ] **Step 4: Commit**

```bash
git add src/api/yandex.js
git commit -m "feat(yandex): search, chart, seed resolution, and stream resolver"
```

---

## Task 5: Route the store to Yandex (temporary, flag-guarded)

**Files:**
- Modify: `src/store/usePlayerStore.js`

- [ ] **Step 1: Add the import and source flag**

After line 5 (`import * as hearthis from '../api/hearthis'`), add:
```js
import * as yandex from '../api/yandex'
```
After the imports block (before `let _pushTimer = null`), add:
```js
// Temporary single-source switch. 'yandex' routes feed/search/recs to Yandex
// only; set VITE_PLAYER_SOURCE=multi (or change this default) to restore the
// Audius + hearthis aggregation below. Nothing is deleted — just shunted.
const SOURCE = import.meta.env.VITE_PLAYER_SOURCE || 'yandex'
```

- [ ] **Step 2: Branch `loadCatalogue`**

Replace the body of `loadCatalogue` (currently lines ~214-235) with:
```js
      loadCatalogue: async () => {
        if (get().catalogueLoaded || get().loadingCatalogue) return
        set({ loadingCatalogue: true })
        try {
          if (SOURCE === 'yandex') {
            const [chart, seed] = await Promise.all([
              yandex.trendingTracks(40).catch(() => []),
              yandex.resolveSeed([...CIS_ARTISTS, ...SEED_ARTISTS], 2).catch(() => []),
            ])
            const library = dedupe([...seed, ...chart, ...SEED_TRACKS])
            set({
              library: library.length ? library : SEED_TRACKS,
              charts: chart.length ? chart : SEED_TRACKS,
              catalogueLoaded: true,
              loadingCatalogue: false,
            })
            return
          }
          const [trend, seed, cisHt, cisAu] = await Promise.all([
            trendingTracks({ time: 'week', limit: 25 }).catch(() => []),
            resolveSeed(SEED_ARTISTS, 2).catch(() => []),
            hearthis.resolveSeed(CIS_ARTISTS, 2).catch(() => []),  // CIS via hearthis
            resolveSeed(CIS_ARTISTS, 1).catch(() => []),           // CIS via Audius (complements hearthis)
          ])
          // CIS first so Russian rap (proper titles) leads the library.
          const library = dedupe([...cisHt, ...cisAu, ...trend, ...seed, ...SEED_TRACKS])
          set({
            library: library.length ? library : SEED_TRACKS,
            charts: (trend.length ? trend : SEED_TRACKS),
            catalogueLoaded: true,
            loadingCatalogue: false,
          })
        } catch {
          set({ loadingCatalogue: false })
        }
      },
```

- [ ] **Step 3: Branch `setSearchQuery`**

In `setSearchQuery`, replace the `Promise.all([...]).then(...)` block (currently the two-source query, lines ~246-256) with:
```js
        // Single-source (Yandex) while SOURCE === 'yandex'; otherwise query both.
        const sources = SOURCE === 'yandex'
          ? [yandex.searchTracks(query, 20).catch(() => [])]
          : [
              hearthis.searchTracks(query, 20).catch(() => []),
              searchTracks(query, 20).catch(() => []),
            ]
        Promise.all(sources)
          .then((lists) => {
            if (get()._searchToken === token) set({ searchResults: dedupe(lists.flat()), searchLoading: false })
          })
          .catch(() => {
            if (get()._searchToken === token) set({ searchResults: [], searchLoading: false })
          })
```

- [ ] **Step 4: Branch `loadRecommendations`**

In `loadRecommendations`, replace the job-building block (currently lines ~278-285, from `const jobs = []` through the cold-start fallback) with:
```js
          const jobs = []
          if (SOURCE === 'yandex') {
            for (const a of topArtists) jobs.push(yandex.searchTracks(a, 6).catch(() => []))
            // Cold start (no signal yet): fall back to the chart.
            if (!jobs.length) jobs.push(yandex.trendingTracks(20).catch(() => []))
          } else {
            for (const a of topArtists) {
              jobs.push(hearthis.searchTracks(a, 4).catch(() => []))
              jobs.push(searchTracks(a, 4).catch(() => []))
            }
            for (const g of (genres || []).slice(0, 3)) jobs.push(trendingTracks({ genre: g, limit: 8 }).catch(() => []))
            // Cold start (no signal yet): fall back to overall trending.
            if (!jobs.length) jobs.push(trendingTracks({ limit: 20 }).catch(() => []))
          }
```

- [ ] **Step 5: Run the store tests**

Run: `npx vitest run src/store/__tests__/usePlayerStore.test.js`
Expected: PASS (the flag defaults don't change pure store logic; network is not exercised in unit tests).

- [ ] **Step 6: Run the full test suite + lint**

Run: `npx vitest run` then `npm run lint`
Expected: all green; no lint errors.

- [ ] **Step 7: Commit**

```bash
git add src/store/usePlayerStore.js
git commit -m "feat(store): route feed/search/recs to Yandex behind SOURCE flag"
```

---

## Task 6: Lazy stream resolution in `AudioEngine`

**Files:**
- Modify: `src/components/AudioEngine.jsx:1-26`

- [ ] **Step 1: Import the resolver**

Change the imports at the top of `src/components/AudioEngine.jsx` to add:
```js
import { getStreamUrl } from '../api/yandex'
```

- [ ] **Step 2: Replace the load effect (lines 17-26) with an async-resolving version**

```js
  // Load + (maybe) play whenever the selected track changes. Yandex tracks have
  // no streamUrl yet — resolve the signed MP3 URL on demand here.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    let cancelled = false
    ;(async () => {
      let url = currentTrack.streamUrl
      if (!url && currentTrack.source === 'yandex' && currentTrack.trackId) {
        try {
          url = await getStreamUrl(currentTrack.trackId)
        } catch (err) {
          console.warn('yandex stream resolve failed, skipping:', err)
          usePlayerStore.getState().nextTrack()
          return
        }
      }
      if (cancelled || !url) return
      if (loadedUrlRef.current === url) return
      loadedUrlRef.current = url
      audio.src = url
      audio.load()
      if (usePlayerStore.getState().isPlaying) {
        audio.play().catch(err => console.warn('autoplay blocked:', err))
      }
    })()
    return () => { cancelled = true }
  }, [currentTrack])
```

- [ ] **Step 3: Run AudioEngine-related tests + full suite**

Run: `npx vitest run`
Expected: PASS. (No existing test asserts the internals of this effect; if one mocks `currentTrack.streamUrl` for Audius, it still works because the `url` is taken directly when present.)

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/AudioEngine.jsx
git commit -m "feat(audio): lazily resolve Yandex stream URL before playback"
```

---

## Task 7: Manual end-to-end verification

**Files:** none (runtime verification).

- [ ] **Step 1: Ensure the token is set**

Confirm `.env.local` has a real `VITE_YANDEX_TOKEN`. (Restart any running dev server after editing env files — Vite only reads them at startup.)

- [ ] **Step 2: Start the proxy**

Run (separate terminal): `npm run proxy`
Expected: `CORS proxy on 0.0.0.0:8080`.

- [ ] **Step 3: Start the app**

Run (separate terminal): `npm run dev`
Open the printed localhost URL.

- [ ] **Step 4: Verify search**

Type a query (e.g. "Lazerhawk") in the search box.
Expected: Yandex results appear (cover art loads). In DevTools Network, requests go to `localhost:8080/https://api.music.yandex.net/search?...` and return 200.

- [ ] **Step 5: Verify playback**

Click a track.
Expected: audio plays. In Network, a `download-info` request (200) is followed by playback from a `*.storage.mds.yandex.net/get-mp3/...` URL. Full track length (not a 30s preview) confirms Plus is active.

- [ ] **Step 6: Verify the feed**

Reload; let the library/charts populate.
Expected: chart + seed-artist tracks render and are playable.

- [ ] **Step 7: Confirm other sources are dormant**

In Network, confirm there are NO requests to `audius.co` or `hearthis.at` during browsing/search.
Expected: none — the app is Yandex-only while `VITE_PLAYER_SOURCE=yandex`.

- [ ] **Step 8 (optional): Token hygiene**

Since the token appeared in chat, after verification re-issue it (Yandex ID → log out devices) and update `.env.local`.

---

## Revert instructions (temporary nature)

To restore Audius + hearthis: set `VITE_PLAYER_SOURCE=multi` in `.env.local` and restart `npm run dev`. No code changes needed; the multi-source paths are intact.
