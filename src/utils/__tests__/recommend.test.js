import { describe, expect, it } from 'vitest'
import { recommend } from '../recommend'

const catalog = [
  { id: '1', title: 'A1', artist: 'Alpha', genre: 'rap', region: 'ru' },
  { id: '2', title: 'A2', artist: 'Alpha', genre: 'rap', region: 'ru' },
  { id: '3', title: 'B1', artist: 'Beta', genre: 'trap', region: 'ru' },
  { id: '4', title: 'C1', artist: 'Gamma', genre: 'emo-rap', region: 'us' },
]

describe('recommend', () => {
  it('cold start returns catalogue order', () => {
    const recs = recommend(catalog, [], {}, 10)
    expect(recs.map(t => t.id)).toEqual(['1', '2', '3', '4'])
  })

  it('prioritises tracks by a liked artist and excludes liked ones', () => {
    const liked = [{ id: '1', title: 'A1', artist: 'Alpha', genre: 'rap', region: 'ru' }]
    const recs = recommend(catalog, liked, {}, 10)
    // Track 2 (same artist Alpha) should rank first; track 1 (liked) excluded
    expect(recs[0].id).toBe('2')
    expect(recs.find(t => t.id === '1')).toBeUndefined()
  })

  it('uses completed listens as a signal', () => {
    const stats = { '3': { plays: 2, completed: 3 } } // user finishes Beta/trap a lot
    const recs = recommend(catalog, [], stats, 10)
    // Beta/trap affinity makes track 3 the top result (it isn't liked, so allowed).
    expect(recs[0].id).toBe('3')
  })
})
