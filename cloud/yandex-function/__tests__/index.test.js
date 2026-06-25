import { describe, it, expect } from 'vitest'
import { isAllowed, patchYandexResponse } from '../index.js'

describe('isAllowed — new endpoints', () => {
  it('allows /account/about', () => {
    expect(isAllowed('https://api.music.yandex.net/account/about')).toBe(true)
  })
  it('allows /rotor/session/123', () => {
    expect(isAllowed('https://api.music.yandex.net/rotor/session/123')).toBe(true)
  })
  it('allows /editorial-promotion', () => {
    expect(isAllowed('https://api.music.yandex.net/editorial-promotion')).toBe(true)
  })
  it('allows /proxy/plus-red-alert/v1/alerts', () => {
    expect(isAllowed('https://api.music.yandex.net/proxy/plus-red-alert/v1/alerts')).toBe(true)
  })
  it('still allows /search', () => {
    expect(isAllowed('https://api.music.yandex.net/search?text=test')).toBe(true)
  })
  it('still blocks unknown paths', () => {
    expect(isAllowed('https://api.music.yandex.net/unknown')).toBe(false)
  })
})

describe('patchYandexResponse', () => {
  it('sets hasPlus=true on /account/about', () => {
    const json = { result: { hasPlus: false, login: 'user' } }
    const patched = patchYandexResponse('https://api.music.yandex.net/account/about', json)
    expect(patched.result.hasPlus).toBe(true)
    expect(patched.result.login).toBe('user')
  })

  it('filters Промокод Upgrade from rotor sequence', () => {
    const json = {
      result: {
        sequence: [
          { track: { title: 'Normal Track' } },
          { track: { title: 'Промокод Upgrade' } },
          { track: { title: 'Another Track' } },
        ],
      },
    }
    const patched = patchYandexResponse('https://api.music.yandex.net/rotor/session/123', json)
    expect(patched.result.sequence).toHaveLength(2)
    expect(patched.result.sequence.some(i => i.track.title === 'Промокод Upgrade')).toBe(false)
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

  it('returns json unchanged for unknown endpoints', () => {
    const json = { result: { foo: 'bar' } }
    expect(patchYandexResponse('https://api.music.yandex.net/search?text=test', json)).toEqual(json)
  })

  it('returns json unchanged for invalid url', () => {
    const json = { result: {} }
    expect(patchYandexResponse('not-a-url', json)).toEqual(json)
  })
})
