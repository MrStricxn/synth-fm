# Yandex-only + Production Serverless Proxy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Yandex.Music the only source (delete Audius/hearthis) and serve it in public production via a Vercel serverless proxy that keeps the OAuth token server-side.

**Architecture:** A new `api/proxy.js` Vercel function injects the token from `YANDEX_TOKEN`, allowlists Yandex hosts/paths, sanitizes CORS, and caches search/chart. Both proxies (local `server/cors-proxy.cjs` and the Vercel function) move to a `?url=` contract. The store, library seed, and onboarding drop all Audius/hearthis code; `colorFor` moves to a neutral `src/api/colors.js`.

**Tech Stack:** Vite + React 19 + Zustand, Vitest, Vercel serverless functions (Node), `js-md5`.

---

## File Structure

- Create: `src/api/colors.js` — `colorFor` (neon gradient per id), moved out of audius.
- Create: `api/proxy.js` — Vercel serverless proxy (token inject + allowlist + CORS + cache).
- Create: `src/__tests__/api-proxy.test.js` — unit tests for `isAllowed` + `buildResponseHeaders` (kept OUT of `api/` so Vercel doesn't treat it as a function).
- Modify: `src/api/yandex.js` — import `colorFor` from `./colors`; `?url=` contract.
- Modify: `server/cors-proxy.cjs` — `?url=` contract.
- Modify: `src/data/library.js` — Yandex seed tracks, single `SEED_ARTISTS`, new `GENRES`, `colorFor` from `../api/colors`.
- Modify: `src/components/Onboarding.jsx` — `GENRES` from `../data/library`.
- Modify: `src/store/usePlayerStore.js` — Yandex-only; remove `SOURCE` flag + audius/hearthis.
- Modify: `src/__tests__/App.integration.test.jsx` — mock `../api/yandex` instead of audius/hearthis.
- Delete: `src/api/audius.js`, `src/api/hearthis.js`.
- Modify: `.env.local`, `.env.example` — drop `VITE_PLAYER_SOURCE`; document `/api/proxy` + `YANDEX_TOKEN`.

---

## Task 1: Extract `colorFor` into `src/api/colors.js`

**Files:**
- Create: `src/api/colors.js`
- Modify: `src/api/yandex.js:7`
- Test: `src/api/__tests__/yandex.test.js` (already green; re-run to confirm no regression)

- [ ] **Step 1: Create `src/api/colors.js`**

```js
// Deterministic neon gradient per id — artwork fallback + dynamic background.
// Lives here (not in a source-specific client) so any source can reuse it.
const PALETTE = [
  ['#9d4edd', '#e0509f'], ['#ff512f', '#dd2476'], ['#1a2980', '#26d0ce'],
  ['#654ea3', '#eaafc8'], ['#11998e', '#38ef7d'], ['#0f2027', '#2c5364'],
  ['#41295a', '#2f0743'], ['#3a1c71', '#d76d77'], ['#f7971e', '#ffd200'],
  ['#5f2c82', '#49a09d'],
]

export function colorFor(id = '') {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const [a, b] = PALETTE[h % PALETTE.length]
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`
}
```

- [ ] **Step 2: Point `yandex.js` at the new module**

In `src/api/yandex.js`, change the import line:
```js
import { colorFor } from './audius'
```
to:
```js
import { colorFor } from './colors'
```
(Leave `src/api/audius.js` untouched for now — other files still import it until later tasks.)

- [ ] **Step 3: Run tests**

Run: `npx vitest run src/api/__tests__/yandex.test.js`
Expected: PASS (5 tests — `normalizeTrack` uses `colorFor`, now sourced from `./colors`).

- [ ] **Step 4: Commit**

```bash
git add src/api/colors.js src/api/yandex.js
git commit -m "refactor(api): extract colorFor into neutral colors module"
```

---

## Task 2: Vercel serverless proxy `api/proxy.js`

**Files:**
- Create: `api/proxy.js`
- Test: `src/__tests__/api-proxy.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/api-proxy.test.js`:
```js
import { describe, it, expect } from 'vitest'
import handler, { isAllowed, buildResponseHeaders } from '../../api/proxy.js'

// Minimal Node-style res double that records writeHead/end without a socket.
function fakeRes() {
  return {
    statusCode: null, headers: null, body: null, ended: false,
    writeHead(code, headers) { this.statusCode = code; this.headers = headers },
    end(body) { this.body = body; this.ended = true },
  }
}

describe('api/proxy isAllowed', () => {
  it('allows the Yandex API search/chart/download-info paths', () => {
    expect(isAllowed('https://api.music.yandex.net/search?text=x&type=track')).toBe(true)
    expect(isAllowed('https://api.music.yandex.net/landing3/chart')).toBe(true)
    expect(isAllowed('https://api.music.yandex.net/tracks/12345/download-info')).toBe(true)
  })

  it('allows storage download-info hosts', () => {
    expect(isAllowed('https://storage.mds.yandex.net/download-info/abc?x=1')).toBe(true)
    expect(isAllowed('https://s1.storage.yandex.net/download-info/abc')).toBe(true)
  })

  it('rejects other paths, hosts, and schemes', () => {
    expect(isAllowed('https://api.music.yandex.net/account/status')).toBe(false)
    expect(isAllowed('https://evil.com/search')).toBe(false)
    expect(isAllowed('http://api.music.yandex.net/search')).toBe(false) // non-https
    expect(isAllowed('not a url')).toBe(false)
  })
})

describe('api/proxy buildResponseHeaders', () => {
  it('collapses upstream + proxy ACAO into a single header', () => {
    const h = buildResponseHeaders({
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
    })
    const acao = Object.keys(h).filter(k => k.toLowerCase() === 'access-control-allow-origin')
    expect(acao).toHaveLength(1)
    expect(h['Access-Control-Allow-Origin']).toBe('*')
    expect(h['content-type']).toBe('application/json')
  })
})

describe('api/proxy handler guards (no network)', () => {
  it('answers OPTIONS preflight with 204', async () => {
    const res = fakeRes()
    await handler({ method: 'OPTIONS', query: {} }, res)
    expect(res.statusCode).toBe(204)
  })

  it('returns 400 when url is missing', async () => {
    const res = fakeRes()
    await handler({ method: 'GET', query: {} }, res)
    expect(res.statusCode).toBe(400)
  })

  it('returns 403 for a non-allowlisted target', async () => {
    const res = fakeRes()
    await handler({ method: 'GET', query: { url: 'https://evil.com/x' } }, res)
    expect(res.statusCode).toBe(403)
  })

  it('returns 405 for non-GET methods', async () => {
    const res = fakeRes()
    await handler({ method: 'POST', query: { url: 'https://api.music.yandex.net/search' } }, res)
    expect(res.statusCode).toBe(405)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/api-proxy.test.js`
Expected: FAIL — cannot import `../../api/proxy.js` (does not exist).

- [ ] **Step 3: Write the implementation**

Create `api/proxy.js`:
```js
// Vercel serverless CORS proxy for Yandex.Music JSON calls (production).
// Keeps the OAuth token server-side: reads YANDEX_TOKEN from the environment and
// injects it, so the token never reaches the browser bundle. Restricts what can
// be proxied (host + path allowlist) so it is not a general open relay.
//
// Contract: GET /api/proxy?url=<encodeURIComponent(full-target-url)>
const TOKEN = process.env.YANDEX_TOKEN || ''

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization,x-requested-with,content-type',
}

// Strip ALL upstream access-control-* headers (Yandex storage sends its own,
// which would duplicate ours and trip the browser's CORS check), then apply one
// CORS set.
export function buildResponseHeaders(upstream) {
  const out = {}
  for (const [k, v] of Object.entries(upstream)) {
    if (k.toLowerCase().startsWith('access-control-')) continue
    out[k] = v
  }
  return { ...out, ...CORS }
}

// Only proxy the exact Yandex endpoints the player needs, over https.
export function isAllowed(urlString) {
  let u
  try { u = new URL(urlString) } catch { return false }
  if (u.protocol !== 'https:') return false
  const host = u.hostname
  if (host === 'api.music.yandex.net') {
    return u.pathname.startsWith('/search')
      || u.pathname.startsWith('/landing3/chart')
      || /^\/tracks\/\d+\/download-info$/.test(u.pathname)
  }
  if (host === 'storage.mds.yandex.net' || host.endsWith('.storage.yandex.net')) {
    return u.pathname.includes('/download-info')
  }
  return false
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return }
  if (req.method !== 'GET') { res.writeHead(405, CORS); res.end('Method not allowed'); return }

  const target = req.query?.url
  if (!target) { res.writeHead(400, CORS); res.end('Missing url'); return }
  if (!isAllowed(target)) { res.writeHead(403, CORS); res.end('Forbidden target'); return }

  let up
  try {
    up = await fetch(target, { headers: { Authorization: `OAuth ${TOKEN}` } })
  } catch (err) {
    res.writeHead(502, CORS); res.end('Proxy error: ' + err.message); return
  }

  const upHeaders = {}
  up.headers.forEach((v, k) => { upHeaders[k] = v })
  const path = new URL(target).pathname
  const cache = (path.startsWith('/search') || path.startsWith('/landing3/chart'))
    ? 'public, s-maxage=300, stale-while-revalidate=600'
    : 'no-store'

  const body = Buffer.from(await up.arrayBuffer())
  res.writeHead(up.status, { ...buildResponseHeaders(upHeaders), 'Cache-Control': cache })
  res.end(body)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/api-proxy.test.js`
Expected: PASS (3 describe blocks, 8 tests).

- [ ] **Step 5: Commit**

```bash
git add api/proxy.js src/__tests__/api-proxy.test.js
git commit -m "feat(proxy): Vercel serverless Yandex proxy with token inject + allowlist"
```

---

## Task 3: Move both proxies + client to the `?url=` contract

**Files:**
- Modify: `server/cors-proxy.cjs`
- Modify: `src/api/yandex.js`

- [ ] **Step 1: Update the local proxy to read `?url=`**

In `server/cors-proxy.cjs`, replace the target-parsing block inside `handler`. The current block is:
```js
  // The path is `/<full-target-url>` — strip the single leading slash.
  const target = req.url.slice(1)
  let url
  try {
    url = new URL(target)
  } catch {
    res.writeHead(400, CORS)
    res.end('Bad target URL')
    return
  }
```
Replace it with:
```js
  // Contract: GET /?url=<encodeURIComponent(full-target-url)>
  let target
  try {
    target = new URL(req.url, `http://${req.headers.host || 'localhost'}`).searchParams.get('url')
  } catch {
    target = null
  }
  if (!target) { res.writeHead(400, CORS); res.end('Missing url'); return }
  let url
  try {
    url = new URL(target)
  } catch {
    res.writeHead(400, CORS)
    res.end('Bad target URL')
    return
  }
```

- [ ] **Step 2: Update the client to build `?url=`**

In `src/api/yandex.js`, change `apiGet` so the fetch URL uses the query contract. Current:
```js
async function apiGet(endpoint) {
  const res = await fetch(`${PROXY}/${API}${endpoint}`, {
    headers: { Authorization: `OAuth ${TOKEN}`, 'X-Requested-With': 'XMLHttpRequest' },
  })
```
Replace the `fetch(...)` line with:
```js
async function apiGet(endpoint) {
  const res = await fetch(`${PROXY}?url=${encodeURIComponent(`${API}${endpoint}`)}`, {
    headers: { Authorization: `OAuth ${TOKEN}`, 'X-Requested-With': 'XMLHttpRequest' },
  })
```

Then in `getStreamUrl`, change the second fetch. Current:
```js
  const res = await fetch(`${PROXY}/${mp3s[0].downloadInfoUrl}&format=json`, {
    headers: { Authorization: `OAuth ${TOKEN}`, 'X-Requested-With': 'XMLHttpRequest' },
  })
```
Replace with:
```js
  const res = await fetch(`${PROXY}?url=${encodeURIComponent(`${mp3s[0].downloadInfoUrl}&format=json`)}`, {
    headers: { Authorization: `OAuth ${TOKEN}`, 'X-Requested-With': 'XMLHttpRequest' },
  })
```

- [ ] **Step 3: Run unit tests + lint**

Run: `npx vitest run src/api/__tests__/yandex.test.js server/__tests__/cors-proxy.test.js`
Expected: PASS (`normalizeTrack`/`buildSignedUrl`/`buildResponseHeaders` unaffected by the URL-building change).
Run: `npx eslint src/api/yandex.js server/cors-proxy.cjs`
Expected: no errors.

- [ ] **Step 4: Live-verify the local proxy end-to-end**

Restart the proxy so the `?url=` change takes effect:
```bash
# Windows PowerShell, in a separate terminal:
#   Get-NetTCPConnection -LocalPort 8080 -State Listen | %{ Stop-Process -Id $_.OwningProcess -Force }
#   npm run proxy
```
Then confirm a search resolves through the new contract (replace <TOKEN> with the real token from `.env.local`):
```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" \
  "http://localhost:8080?url=$(node -e "console.log(encodeURIComponent('https://api.music.yandex.net/search?text=test&type=track&page=0'))")" \
  -H "Authorization: OAuth <TOKEN>" -H "Origin: http://localhost:5173"
```
Expected: `HTTP 200`.

- [ ] **Step 5: Commit**

```bash
git add server/cors-proxy.cjs src/api/yandex.js
git commit -m "refactor(proxy): switch local proxy + client to ?url= contract"
```

---

## Task 4: Store becomes Yandex-only

> Ordering: the store must drop its `CIS_ARTISTS` import BEFORE Task 5 removes that export from `library.js`, or the build breaks between tasks.

**Files:**
- Modify: `src/store/usePlayerStore.js`
- Modify: `src/__tests__/App.integration.test.jsx`

- [ ] **Step 1: Replace the imports + remove the SOURCE flag**

In `src/store/usePlayerStore.js`, replace these lines:
```js
import { SEED_TRACKS, SEED_ARTISTS, CIS_ARTISTS } from '../data/library'
import { trendingTracks, searchTracks, resolveSeed } from '../api/audius'
import * as hearthis from '../api/hearthis'
import * as yandex from '../api/yandex'
```
with:
```js
import { SEED_TRACKS, SEED_ARTISTS } from '../data/library'
import * as yandex from '../api/yandex'
```
Then delete the `SOURCE` flag block (added in the previous phase):
```js
// Temporary single-source switch. 'yandex' routes feed/search/recs to Yandex
// only; set VITE_PLAYER_SOURCE=multi (or change this default) to restore the
// Audius + hearthis aggregation below. Nothing is deleted — just shunted.
const SOURCE = import.meta.env.VITE_PLAYER_SOURCE || 'yandex'
```

- [ ] **Step 2: Replace `loadCatalogue` with the Yandex-only version**

Replace the entire `loadCatalogue` method with:
```js
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
```

- [ ] **Step 3: Replace the search query block in `setSearchQuery`**

Replace this block (current):
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
with:
```js
        yandex.searchTracks(query, 20)
          .then((results) => {
            if (get()._searchToken === token) set({ searchResults: dedupe(results), searchLoading: false })
          })
          .catch(() => {
            if (get()._searchToken === token) set({ searchResults: [], searchLoading: false })
          })
```

- [ ] **Step 4: Replace the job-building block in `loadRecommendations`**

Replace this block (current):
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
with:
```js
          const jobs = []
          for (const a of topArtists) jobs.push(yandex.searchTracks(a, 6).catch(() => []))
          for (const g of (genres || []).slice(0, 3)) jobs.push(yandex.searchTracks(g, 6).catch(() => []))
          // Cold start (no signal yet): fall back to the chart.
          if (!jobs.length) jobs.push(yandex.trendingTracks(20).catch(() => []))
```

- [ ] **Step 5: Repoint the integration test mock at Yandex**

In `src/__tests__/App.integration.test.jsx`, replace both `vi.mock(...)` blocks (lines 7-22) with a single Yandex mock:
```js
// The app streams from Yandex. Mock the API so tests never hit the network.
vi.mock('../api/yandex', () => ({
  trendingTracks: vi.fn(() => Promise.resolve([])),
  searchTracks: vi.fn(() => Promise.resolve([])),
  resolveSeed: vi.fn(() => Promise.resolve([])),
  getStreamUrl: vi.fn(() => Promise.resolve('https://stream.test/x.mp3')),
  normalizeTrack: vi.fn(),
}))
```

- [ ] **Step 6: Run the full suite + lint**

Run: `npx vitest run`
Expected: PASS (all). The store no longer imports audius/hearthis; the integration test mocks yandex; `library.js` still exports the (Audius-era) `SEED_TRACKS`/`SEED_ARTISTS` lists so initial state renders. `audius.js`/`hearthis.js` still exist and are pure (no network) where still imported by `library.js`/`Onboarding.jsx`.
Run: `npx eslint src/store/usePlayerStore.js src/__tests__/App.integration.test.jsx`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/store/usePlayerStore.js src/__tests__/App.integration.test.jsx
git commit -m "feat(store): Yandex-only; drop SOURCE flag and Audius/hearthis"
```

---

## Task 5: Reseed `src/data/library.js` with Yandex tracks

**Files:**
- Modify: `src/data/library.js`

- [ ] **Step 1: Replace the imports + seed + artist lists**

Replace the top of `src/data/library.js` — from the file start through the `export const SEED_TRACKS = raw.map(build)` line and the `SEED_ARTISTS`/`CIS_ARTISTS` exports — with:
```js
// Static seed catalogue (Yandex). Real chart track ids captured 2026-06-05 (kz
// region) so the app paints instantly and the test suite runs offline. At
// runtime `loadCatalogue()` fetches the live chart + resolves SEED_ARTISTS.
import { colorFor } from '../api/colors'

function cover(uri, size = '400x400') {
  return uri ? `https://${uri.replace('%%', size)}` : ''
}

const rawYa = [
  { id: '151020719', title: 'Шадэ', artist: 'By Индия', cover: 'avatars.yandex.net/get-music-content/16154377/525b9915.a.41920857-2/%%', dur: 168940 },
  { id: '150053393', title: 'Мальборо', artist: 'SAYAN', cover: 'avatars.yandex.net/get-music-content/19999910/9afd1da4.a.41489388-1/%%', dur: 122720 },
  { id: '151136140', title: 'ЭКСПОНАТ', artist: 'MIA BOYKA', cover: 'avatars.yandex.net/get-music-content/20372582/82527af1.a.41976933-2/%%', dur: 98760 },
  { id: '151724864', title: 'Біз жолығамыз', artist: 'Abzal Uteshov', cover: 'avatars.yandex.net/get-music-content/19035207/af7ffaa4.a.42228159-1/%%', dur: 176300 },
  { id: '150372866', title: 'Махаббатым - Qazaq Edition', artist: 'baqzhvn', cover: 'avatars.yandex.net/get-music-content/16450533/5aaede59.a.41636053-1/%%', dur: 230010 },
  { id: '151092654', title: 'Sagynysh', artist: 'Sadraddin', cover: 'avatars.yandex.net/get-music-content/16154377/e8523e30.a.41958888-1/%%', dur: 165920 },
  { id: '150056922', title: 'Ademi', artist: 'Kalifarniya', cover: 'avatars.yandex.net/get-music-content/17696724/947e24b2.a.41491054-1/%%', dur: 228000 },
  { id: '147654214', title: 'ВАТ ИЗ ЛАВ', artist: 'Junior', cover: 'avatars.yandex.net/get-music-content/17740720/97c3f996.a.40416390-1/%%', dur: 145800 },
]

export const SEED_TRACKS = rawYa.map(t => ({
  id: `ya_${t.id}`,
  trackId: t.id,
  title: t.title,
  artist: t.artist,
  artwork: cover(t.cover),
  streamUrl: '',
  duration: t.dur,
  genre: '',
  playCount: 0,
  color: colorFor(`ya_${t.id}`),
  source: 'yandex',
}))

// Artist / query terms resolved against Yandex search at runtime to broaden the
// catalogue beyond the chart.
export const SEED_ARTISTS = [
  'oxxxymiron', 'miyagi andy panda', 'pharaoh', 'skriptonit', 'big baby tape',
  'kizaru', 'basta', 'morgenshtern', 'jah khalib', 'noize mc', 'face',
  'obladaet', 'og buda', 't-fest', 'gone fludd', 'mayot', 'soda luv',
  'platina', 'boulevard depo', 'seemee', 'kavinsky', 'synthwave', 'phonk',
]

// Genre chips for onboarding + recommendation seeds (used as Yandex search terms).
export const GENRES = [
  'Synthwave', 'Phonk', 'Hip-Hop', 'Electronic', 'Lo-Fi',
  'House', 'Drum & Bass', 'Pop', 'Rock', 'R&B',
]
```

Note: the `CIS_ARTISTS` export is removed (merged into `SEED_ARTISTS`). The store already stopped importing it in Task 4, so nothing else references it.

- [ ] **Step 2: Keep the backwards-compatible exports**

The lines below (after the removed block) already read:
```js
// Backwards-compatible exports (consumed by store/tests/views).
export const LIBRARY = SEED_TRACKS
export const ALL_TRACKS = SEED_TRACKS
export const CHARTS_RU = SEED_TRACKS
export const CHARTS_US = []
export const DISCOVER_TRACKS = SEED_TRACKS
```
Leave them unchanged.

- [ ] **Step 3: Confirm the module imports cleanly (no audius dependency)**

Run: `npx vitest run src/store/__tests__/usePlayerStore.test.js`
Expected: PASS. The store imports `{ SEED_TRACKS, SEED_ARTISTS }` from library (Task 4 already dropped `CIS_ARTISTS`), and `library.js` now imports `colorFor` from `../api/colors` (not audius), so the module graph is clean.

- [ ] **Step 4: Commit**

```bash
git add src/data/library.js
git commit -m "feat(library): Yandex chart seed tracks + single SEED_ARTISTS + GENRES"
```

---

## Task 6: Onboarding uses `GENRES`

**Files:**
- Modify: `src/components/Onboarding.jsx`

- [ ] **Step 1: Swap the import and the map source**

In `src/components/Onboarding.jsx`, change the import:
```js
import { AUDIUS_GENRES } from '../api/audius'
```
to:
```js
import { GENRES } from '../data/library'
```
And change the chip map:
```js
          {AUDIUS_GENRES.map(g => (
```
to:
```js
          {GENRES.map(g => (
```

- [ ] **Step 2: Run the suite**

Run: `npx vitest run`
Expected: PASS (Onboarding renders `GENRES`). `audius.js` still exists (deleted in Task 7), so any remaining import of it resolves; the integration test already mocks yandex (Task 4).

- [ ] **Step 3: Commit**

```bash
git add src/components/Onboarding.jsx
git commit -m "feat(onboarding): use neutral GENRES list"
```

---

## Task 7: Delete Audius + hearthis

**Files:**
- Delete: `src/api/audius.js`, `src/api/hearthis.js`

- [ ] **Step 1: Confirm nothing imports them**

Run: `rg -n "api/audius|api/hearthis" src`
Expected: NO matches. If any remain, fix that file before deleting.

- [ ] **Step 2: Delete the files**

```bash
git rm src/api/audius.js src/api/hearthis.js
```

- [ ] **Step 3: Run the full suite + lint + build**

Run: `npx vitest run`
Expected: PASS (all).
Run: `npm run lint`
Expected: no errors.
Run: `npm run build`
Expected: build succeeds (no unresolved imports).

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove Audius and hearthis sources (Yandex-only)"
```

---

## Task 8: Environment defaults + Vercel config

**Files:**
- Modify: `src/api/yandex.js:10`
- Modify: `.env.local`
- Modify: `.env.example`

- [ ] **Step 1: Default the proxy to the production path**

In `src/api/yandex.js`, change the `PROXY` default:
```js
const PROXY = (import.meta.env.VITE_YANDEX_PROXY || 'http://localhost:8080').replace(/\/$/, '')
```
to:
```js
const PROXY = (import.meta.env.VITE_YANDEX_PROXY || '/api/proxy').replace(/\/$/, '')
```
(Local dev keeps `http://localhost:8080` via `.env.local`; production has no `VITE_YANDEX_PROXY`, so it falls back to `/api/proxy` — the serverless function.)

- [ ] **Step 2: Drop the dead flag from `.env.local`**

In `.env.local`, delete the line:
```
VITE_PLAYER_SOURCE=yandex
```
Keep `VITE_YANDEX_TOKEN=...` and `VITE_YANDEX_PROXY=http://localhost:8080`.

- [ ] **Step 3: Update `.env.example`**

Replace the Yandex section of `.env.example` with:
```
# Yandex.Music OAuth token (LOCAL DEV ONLY — used by the local proxy via the
# client). Get it by opening this URL, logging in, and copying the access_token
# from the redirected address bar (#access_token=...):
# https://oauth.yandex.ru/authorize?response_type=token&client_id=23cabbbdc6cd418abb4b39c32c41195d
VITE_YANDEX_TOKEN=

# CORS proxy base. Local dev: http://localhost:8080 (run `npm run proxy`).
# Production: leave UNSET — the app defaults to the serverless function /api/proxy.
VITE_YANDEX_PROXY=http://localhost:8080

# PRODUCTION (Vercel): set YANDEX_TOKEN (NO vite prefix) as a server-side env var
# in the Vercel dashboard. The serverless function injects it; it never reaches
# the browser bundle. Do NOT set VITE_YANDEX_TOKEN in production.
```

- [ ] **Step 4: Verify the build still works**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/api/yandex.js .env.example
git commit -m "chore(env): default proxy to /api/proxy; document Vercel YANDEX_TOKEN"
```
(Do NOT `git add .env.local`.)

- [ ] **Step 6: Record the Vercel env step (user action — surface in the final report)**

The user must add the server-side token in Vercel before the deploy will play music:
1. Vercel → the `synth-fm` project → **Settings → Environment Variables**.
2. Add `YANDEX_TOKEN` = `<the OAuth token>`, scope **Production** (and Preview if desired). **Not** `VITE_`-prefixed.
3. Redeploy (or it applies on the next push).

---

## Task 9: Final verification

**Files:** none (verification).

- [ ] **Step 1: Full suite, lint, build**

Run: `npx vitest run` → all PASS.
Run: `npm run lint` → no errors.
Run: `npm run build` → succeeds.

- [ ] **Step 2: Local end-to-end (proxy + dev server)**

Ensure `npm run proxy` is running and start `npm run dev`. In the browser:
- Search returns Yandex tracks (Network: requests to `localhost:8080?url=...` → 200).
- Clicking a track plays a full song (download-info 200, then audio from `*.storage.yandex.net`).
- No requests to `audius.co` or `hearthis.at` anywhere.

- [ ] **Step 3: Confirm no Audius/hearthis remnants**

```bash
rg -n "audius|hearthis" src api server
```
Expected: no matches (comments included). If a stray comment remains, clean it and re-commit.

---

## Deploy (after the plan, with user confirmation)

Push `master` to GitHub → Vercel auto-deploys. The deployed site uses `/api/proxy` (serverless) + the server-side `YANDEX_TOKEN`. The final MP3 streams directly from Yandex storage. Remember: a single shared token under public traffic risks Yandex rate-limiting/ban — accepted trade-off.
