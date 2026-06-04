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

http
  .createServer((req, res) => {
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
      res.writeHead(up.statusCode, { ...up.headers, ...CORS })
      up.pipe(res)
    })
    upstream.on('error', (err) => {
      res.writeHead(502, CORS)
      res.end('Proxy error: ' + err.message)
    })
    req.pipe(upstream)
  })
  .listen(port, host, () => {
    console.log(`CORS proxy on ${host}:${port}`)
  })
