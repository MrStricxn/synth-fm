import { describe, it, expect } from 'vitest'
import { normalizeTrack } from '../yandex'

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
