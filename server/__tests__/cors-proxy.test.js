import { describe, it, expect } from 'vitest'
import proxy from '../cors-proxy.cjs'

const { buildResponseHeaders } = proxy

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
