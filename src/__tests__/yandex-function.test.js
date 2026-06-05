import { describe, it, expect } from 'vitest'
import { handler, isAllowed, buildResponseHeaders } from '../../cloud/yandex-function/index.js'

describe('yandex-function isAllowed', () => {
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

describe('yandex-function buildResponseHeaders', () => {
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

describe('yandex-function handler guards (no network)', () => {
  it('answers OPTIONS preflight with 204', async () => {
    const res = await handler({ httpMethod: 'OPTIONS', queryStringParameters: {} })
    expect(res.statusCode).toBe(204)
  })

  it('returns 400 when url is missing', async () => {
    const res = await handler({ httpMethod: 'GET', queryStringParameters: {} })
    expect(res.statusCode).toBe(400)
  })

  it('returns 403 for a non-allowlisted target', async () => {
    const res = await handler({ httpMethod: 'GET', queryStringParameters: { url: 'https://evil.com/x' } })
    expect(res.statusCode).toBe(403)
  })

  it('returns 405 for non-GET methods', async () => {
    const res = await handler({ httpMethod: 'POST', queryStringParameters: { url: 'https://api.music.yandex.net/search' } })
    expect(res.statusCode).toBe(405)
  })
})
