import { describe, it, expect } from 'vitest'
import { normalizeTrack } from '../yandex'
import md5 from 'js-md5'
import { buildSignedUrl, SIGN_SALT } from '../yandex'

describe('yandex normalizeTrack', () => {
  const raw = {
    id: 12345,
    title: 'Lazerhawk',
    artists: [{ name: 'Lazerhawk' }, { name: 'Guest' }],
    durationMs: 215000,
    coverUri: 'avatars.yandex.net/get-music-content/abc/%%',
  }

  it('maps Yandex fields to the shared track shape', () => {
    const t = normalizeTrack(raw)
    expect(t.id).toBe('ya_12345')
    expect(t.trackId).toBe('12345')
    expect(t.title).toBe('Lazerhawk')
    expect(t.artist).toBe('Lazerhawk') // first artist
    expect(t.duration).toBe(215000)    // durationMs passthrough (ms)
    expect(t.source).toBe('yandex')
    expect(t.streamUrl).toBe('')       // resolved lazily at play time
  })

  it('expands the %% cover template to a 400x400 https URL', () => {
    const t = normalizeTrack(raw)
    expect(t.artwork).toBe('https://avatars.yandex.net/get-music-content/abc/400x400')
  })

  it('falls back gracefully when fields are missing', () => {
    const t = normalizeTrack({ id: 9 })
    expect(t.id).toBe('ya_9')
    expect(t.title).toBe('Untitled')
    expect(t.artist).toBe('Unknown')
    expect(t.duration).toBe(0)
    expect(t.artwork).toBe('')
  })
})

describe('yandex buildSignedUrl', () => {
  const info = { host: 's1.storage.mds.yandex.net', path: '/get-mp3/abc/123/file.mp3', ts: '1700000000', s: 'deadbeef' }

  it('proves the md5 dependency works (known vector)', () => {
    expect(md5('abc')).toBe('900150983cd24fb0d6963f7d28e17f72')
  })

  it('signs with salt + path-without-leading-slash + s, in the get-mp3 layout', () => {
    const calls = []
    const fakeMd5 = (input) => { calls.push(input); return 'SIGN' }
    const url = buildSignedUrl(info, fakeMd5)
    expect(calls[0]).toBe(`${SIGN_SALT}get-mp3/abc/123/file.mp3deadbeef`)
    expect(url).toBe('https://s1.storage.mds.yandex.net/get-mp3/SIGN/1700000000/get-mp3/abc/123/file.mp3')
  })
})
