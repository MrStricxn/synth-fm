// Local CORS proxy for Yandex.Music JSON calls. Run with `npm run proxy`.
//
// Why not cors-anywhere: a browser always attaches an `Origin` header to its
// cross-origin fetch, and JS cannot remove it. Yandex's WAF answers 403 to any
// request carrying `Origin`, so the proxy MUST strip it (and `Referer`) before
// forwarding upstream. cors-anywhere forwards them verbatim, so we use this
// minimal pass-through instead. Keeps the OAuth token on YOUR machine — requests
// transit localhost, not a third-party host.
//
// Usage: GET http://localhost:8080/<full-target-url>
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

// Build the response headers we send back to the browser. Yandex's storage host
// already sets its own `access-control-allow-origin`, so naively appending ours
// (different casing = a second header key) yields TWO ACAO headers — which every
// browser rejects as a CORS error. Strip ALL upstream access-control-* headers
// first, then apply exactly one CORS set.
function buildResponseHeaders(upstream) {
  const out = {}
  for (const [k, v] of Object.entries(upstream)) {
    if (k.toLowerCase().startsWith('access-control-')) continue
    out[k] = v
  }
  return { ...out, ...CORS }
}

function handler(req, res) {
  // Answer the browser's CORS preflight locally — never forward it upstream.
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS)
    res.end()
    return
  }

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

  // Forward request headers minus the ones that leak the browser origin (→ 403)
  // or describe the wrong hop. Authorization (OAuth token) is preserved.
  const headers = { ...req.headers }
  delete headers.origin
  delete headers.referer
  delete headers.connection
  delete headers['x-requested-with']
  headers.host = url.host

  const upstream = https.request(url, { method: req.method, headers }, (up) => {
    res.writeHead(up.statusCode, buildResponseHeaders(up.headers))
    up.pipe(res)
  })
  upstream.on('error', (err) => {
    res.writeHead(502, CORS)
    res.end('Proxy error: ' + err.message)
  })
  req.pipe(upstream)
}

// Only start listening when run directly (`node server/cors-proxy.cjs`), so the
// module can be imported in tests without binding the port.
if (require.main === module) {
  http.createServer(handler).listen(port, host, () => {
    console.log(`CORS proxy on ${host}:${port}`)
  })
}

module.exports = { buildResponseHeaders, handler, CORS }
