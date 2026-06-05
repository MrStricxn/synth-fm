// Yandex Cloud Function — Yandex.Music JSON proxy (must run in a CIS region).
//
// Why this exists: Vercel's serverless functions run in US/EU datacenters, and
// Yandex.Music answers 451 (Unavailable For Legal Reasons) to any request from
// outside the CIS — so the proxy CANNOT live on Vercel. Yandex Cloud runs in a
// Russian datacenter where the API is licensed, so requests succeed. The OAuth
// token is injected here from the YANDEX_TOKEN env var (never in the browser).
//
// Deploy: runtime nodejs18, entry point `index.handler`, make the function
// PUBLIC, set env var YANDEX_TOKEN. See README.md.
//
// Contract: GET <function-url>?url=<encodeURIComponent(full-target-url)>

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

// Yandex Cloud Function HTTP integration: event has httpMethod /
// queryStringParameters; return { statusCode, headers, body, isBase64Encoded }.
export async function handler(event) {
  const method = event.httpMethod
  if (method === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (method !== 'GET') return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  const target = event.queryStringParameters?.url
  if (!target) return { statusCode: 400, headers: CORS, body: 'Missing url' }
  if (!isAllowed(target)) return { statusCode: 403, headers: CORS, body: 'Forbidden target' }

  let up
  try {
    up = await fetch(target, { headers: { Authorization: `OAuth ${process.env.YANDEX_TOKEN || ''}` } })
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: 'Proxy error: ' + err.message }
  }

  const upHeaders = {}
  up.headers.forEach((v, k) => { upHeaders[k] = v })
  const path = new URL(target).pathname
  const cache = (path.startsWith('/search') || path.startsWith('/landing3/chart'))
    ? 'public, s-maxage=300, stale-while-revalidate=600'
    : 'no-store'

  const buf = Buffer.from(await up.arrayBuffer())
  return {
    statusCode: up.status,
    headers: { ...buildResponseHeaders(upHeaders), 'Cache-Control': cache },
    body: buf.toString('base64'),
    isBase64Encoded: true,
  }
}
