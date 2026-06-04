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
