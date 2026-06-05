# Yandex.Music proxy — Yandex Cloud Function

This is the **production** proxy for SYNTH.FM. It must run inside the CIS, because
Yandex.Music answers `451 Unavailable For Legal Reasons` to any request from a
non-CIS IP. Vercel's serverless functions run in US/EU datacenters, so the proxy
**cannot** live on Vercel — it lives here, on a Yandex Cloud Function (Russian
datacenter), where the API is licensed and responds normally.

The browser never sees the OAuth token: it is injected server-side from the
`YANDEX_TOKEN` environment variable.

```
browser ──GET?url=…──▶ Yandex Cloud Function ──OAuth token──▶ api.music.yandex.net
```

The final MP3 streams **directly** from `*.storage.yandex.net` to the listener's
browser (no proxy, no token) — fine for a CIS audience whose IPs are allowed.

## Contract

```
GET https://functions.yandexcloud.net/<function-id>?url=<encodeURIComponent(target)>
```

Allowed `target`s (allowlist in `index.js` → `isAllowed`):

- `https://api.music.yandex.net/search…`
- `https://api.music.yandex.net/landing3/chart…`
- `https://api.music.yandex.net/tracks/<id>/download-info`
- `https://*.storage.yandex.net/…/download-info`, `https://storage.mds.yandex.net/…/download-info`

## Deploy (Yandex Cloud Console)

1. Open <https://console.yandex.cloud/> → **Cloud Functions** → **Create function**.
   Give it a name, e.g. `synthfm-yandex-proxy`.
2. **Create an editor version:**
   - **Runtime:** `nodejs18`
   - **Entry point:** `index.handler`
   - **Method:** upload the two files in this folder (`index.js`, `package.json`),
     or paste `index.js` into the inline editor and add `package.json`.
   - **Environment variables:** add `YANDEX_TOKEN` = your OAuth token.
   - **Timeout:** 30 s is plenty. **Memory:** 128 MB is enough.
   - Click **Create version**.
3. **Make it public:** function → **Overview** → toggle **Public function** ON
   (or grant `serverless.functions.invoker` to `allUsers`). Without this the URL
   returns 403 to the browser.
4. **Copy the invoke URL:** `https://functions.yandexcloud.net/<function-id>`.

## Wire the frontend (Vercel)

In the Vercel project's **Environment Variables**:

- **Set** `VITE_YANDEX_PROXY` = `https://functions.yandexcloud.net/<function-id>`
  (the URL from step 4 — no trailing slash needed, the client trims it).
- **Remove** the old `YANDEX_TOKEN` from Vercel — it is no longer used there
  (the token now lives only in the Yandex Cloud Function).

Then **redeploy** on Vercel so the new `VITE_YANDEX_PROXY` is baked into the bundle.

> Note: `VITE_YANDEX_PROXY` is a build-time public var (it ends up in the JS
> bundle). That's fine — it only contains the proxy URL, never the token.

## Local development

For local dev you don't need this function — run the local proxy instead:

```
npm run proxy   # server/cors-proxy.cjs on :8080, token from VITE_YANDEX_TOKEN
npm run dev
```

The client defaults `VITE_YANDEX_PROXY` to `http://localhost:8080` when unset.

## Test the deployed function

```bash
# chart (should be 200 + JSON)
curl "https://functions.yandexcloud.net/<id>?url=$(node -e "console.log(encodeURIComponent('https://api.music.yandex.net/landing3/chart'))")"
```
