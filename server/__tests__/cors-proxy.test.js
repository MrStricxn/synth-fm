import { describe, it, expect } from 'vitest'
import proxy from '../cors-proxy.cjs'

const { buildResponseHeaders, patchYandexResponse } = proxy

describe('cors-proxy buildResponseHeaders', () => {
  it('collapses an upstream ACAO + the proxy ACAO into a single header', () => {
    // Yandex storage already sends a lowercase `access-control-allow-origin`.
    // Without stripping it, the proxy would emit two ACAO headers (different
    // casing = two keys) and browsers reject the response as a CORS error.
    const h = buildResponseHeaders({
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-expose-headers': 'x-foo',
    })
    const acao = Object.keys(h).filter(k => k.toLowerCase() === 'access-control-allow-origin')
    expect(acao).toHaveLength(1)
    expect(h['Access-Control-Allow-Origin']).toBe('*')
  })

  it('drops all upstream access-control-* headers but keeps the rest', () => {
    const h = buildResponseHeaders({
      'content-type': 'audio/mpeg',
      'access-control-expose-headers': 'x-foo',
      'access-control-allow-methods': 'GET',
    })
    expect(Object.keys(h).some(k => k.toLowerCase() === 'access-control-expose-headers')).toBe(false)
    expect(h['content-type']).toBe('audio/mpeg')
    expect(h['Access-Control-Allow-Methods']).toBe('GET,POST,OPTIONS')
  })
})

describe('cors-proxy patchYandexResponse', () => {
  it('sets hasPlus=true on /account/about', () => {
    const json = { result: { hasPlus: false, login: 'user' } }
    const patched = patchYandexResponse('https://api.music.yandex.net/account/about', json)
    expect(patched.result.hasPlus).toBe(true)
    expect(patched.result.login).toBe('user')
  })

  it('filters Промокод Upgrade from rotor session', () => {
    const json = {
      result: {
        sequence: [
          { track: { title: 'Good Track' } },
          { track: { title: 'Промокод Upgrade' } },
        ],
      },
    }
    const patched = patchYandexResponse('https://api.music.yandex.net/rotor/session/abc', json)
    expect(patched.result.sequence).toHaveLength(1)
    expect(patched.result.sequence[0].track.title).toBe('Good Track')
  })

  it('does NOT filter rotor feedback URLs', () => {
    const json = { result: { sequence: [{ track: { title: 'Промокод Upgrade' } }] } }
    const patched = patchYandexResponse('https://api.music.yandex.net/rotor/session/feedback', json)
    expect(patched.result.sequence).toHaveLength(1)
  })

  it('clears promotions on /editorial-promotion', () => {
    const json = { result: { promotions: [{ id: 1 }] } }
    const patched = patchYandexResponse('https://api.music.yandex.net/editorial-promotion', json)
    expect(patched.result.promotions).toEqual([])
  })

  it('clears alerts on /proxy/plus-red-alert/', () => {
    const json = { result: { alerts: [{ id: 1 }] } }
    const patched = patchYandexResponse('https://api.music.yandex.net/proxy/plus-red-alert/v1/alerts', json)
    expect(patched.result.alerts).toEqual([])
  })

  it('returns json unchanged for unknown path', () => {
    const json = { result: { foo: 'bar' } }
    expect(patchYandexResponse('https://api.music.yandex.net/search', json)).toEqual(json)
  })
})
