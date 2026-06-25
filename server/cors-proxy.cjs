// Local CORS proxy for Yandex.Music JSON calls. Run with `npm run proxy`.
//
// Why not cors-anywhere: a browser always attaches an `Origin` header to its
// cross-origin fetch, and JS cannot remove it. Yandex's WAF answers 403 to any
// request carrying `Origin`, so the proxy MUST strip it (and `Referer`) before
// forwarding upstream. cors-anywhere forwards them verbatim, so we use this
// minimal pass-through instead. Keeps the OAuth token on YOUR machine — requests
// transit localhost, not a third-party host.
//
// Usage: GET http://localhost:8080/?url=<encodeURIComponent(full-target-url)>
const http = require('http')
const https = require('https')
const { URL } = require('url')

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 8080

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization,x-requested-with,content-type',
}

function buildResponseHeaders(upstream) {
  const out = {}
  for (const [k, v] of Object.entries(upstream)) {
    if (k.toLowerCase().startsWith('access-control-')) continue
    out[k] = v
  }
  return { ...out, ...CORS }
}

// Patch Yandex API JSON responses to simulate a Plus subscription.
// Pure function — mutates json in place and returns it.
function patchYandexResponse(urlString, json) {
  let pathname
  try { pathname = new URL(urlString).pathname } catch { return json }

  if (pathname.startsWith('/account/about')) {
    if (json?.result) json.result.hasPlus = true
    return json
  }
  if (pathname.startsWith('/rotor/session/') && !pathname.includes('feedback')) {
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

function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS)
    res.end()
    return
  }

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

  const headers = { ...req.headers }
  delete headers.origin
  delete headers.referer
  delete headers.connection
  delete headers['x-requested-with']
  headers.host = url.host

  const upstream = https.request(url, { method: req.method, headers }, (up) => {
    const chunks = []
    up.on('data', chunk => chunks.push(chunk))
    up.on('end', () => {
      let body = Buffer.concat(chunks)
      const ct = up.headers['content-type'] || ''
      if (ct.includes('application/json')) {
        try {
          const patched = patchYandexResponse(target, JSON.parse(body.toString('utf8')))
          body = Buffer.from(JSON.stringify(patched), 'utf8')
        } catch { /* non-JSON body — forward as-is */ }
      }
      res.writeHead(up.statusCode, buildResponseHeaders(up.headers))
      res.end(body)
    })
    up.on('error', () => { res.writeHead(502, CORS); res.end('Upstream error') })
  })
  upstream.on('error', (err) => {
    res.writeHead(502, CORS)
    res.end('Proxy error: ' + err.message)
  })
  req.pipe(upstream)
}

if (require.main === module) {
  http.createServer(handler).listen(port, host, () => {
    console.log(`CORS proxy on ${host}:${port}`)
  })
}

module.exports = { buildResponseHeaders, handler, CORS, patchYandexResponse }
