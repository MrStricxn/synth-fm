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
