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

export function buildResponseHeaders(upstream) {
  const out = {}
  for (const [k, v] of Object.entries(upstream)) {
    const lk = k.toLowerCase()
    if (lk.startsWith('access-control-') || lk === 'content-length') continue
    out[k] = v
  }
  return { ...out, ...CORS }
}

export function isAllowed(urlString) {
  let u
  try { u = new URL(urlString) } catch { return false }
  if (u.protocol !== 'https:') return false
  const host = u.hostname
  if (host === 'api.music.yandex.net') {
    return u.pathname.startsWith('/search')
      || u.pathname.startsWith('/landing3/chart')
      || /^\/tracks\/\d+\/download-info$/.test(u.pathname)
      || u.pathname.startsWith('/account/about')
      || u.pathname.startsWith('/rotor/session/')
      || u.pathname.startsWith('/editorial-promotion')
      || u.pathname.startsWith('/proxy/plus-red-alert/')
  }
  if (host === 'storage.mds.yandex.net' || host.endsWith('.storage.yandex.net')) {
    return u.pathname.includes('/download-info')
  }
  return false
}

// Patch Yandex API JSON responses to simulate a Plus subscription.
// Pure function — mutates json in place and returns it.
export function patchYandexResponse(urlString, json) {
  let pathname
  try { pathname = new URL(urlString).pathname } catch { return json }

  if (pathname.startsWith('/account/about')) {
    if (json?.result) json.result.hasPlus = true
    return json
  }
  if (pathname.startsWith('/rotor/session/') && !urlString.includes('feedback')) {
    if (Array.isArray(json?.result?.sequence)) {
      json.result.sequence = json.result.sequence.filter(
        item => item?.track?.title !== 'Промокод Upgrade'
      )
    }
    return json
  }
  if (pathname.startsWith('/editorial-promotion')) {
    if (json?.result) json.result.promotions = []
    return json
  }
  if (pathname.startsWith('/proxy/plus-red-alert/')) {
    if (json?.result) json.result.alerts = []
    return json
  }
  return json
}

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

  let buf = Buffer.from(await up.arrayBuffer())
  const ct = upHeaders['content-type'] || ''
  if (ct.includes('application/json')) {
    try {
      const patched = patchYandexResponse(target, JSON.parse(buf.toString('utf8')))
      buf = Buffer.from(JSON.stringify(patched), 'utf8')
    } catch { /* non-JSON body — forward as-is */ }
  }

  return {
    statusCode: up.status,
    headers: { ...buildResponseHeaders(upHeaders), 'Cache-Control': cache },
    body: buf.toString('base64'),
    isBase64Encoded: true,
  }
}
