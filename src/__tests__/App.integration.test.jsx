import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'
import { usePlayerStore } from '../store/usePlayerStore'
import { LIBRARY } from '../data/library'

// The app streams from Yandex. Mock the API so tests never hit the network.
vi.mock('../api/yandex', () => ({
  trendingTracks: vi.fn(() => Promise.resolve([])),
  searchTracks: vi.fn(() => Promise.resolve([])),
  resolveSeed: vi.fn(() => Promise.resolve([])),
  getStreamUrl: vi.fn(() => Promise.resolve('https://stream.test/x.mp3')),
  normalizeTrack: vi.fn(),
}))

beforeEach(() => {
  // onboarded=true skips the first-run genre overlay.
  usePlayerStore.setState({ ...usePlayerStore.getState().getInitialState(), onboarded: true })
})

describe('App integration', () => {
  it('renders the full app without crashing', () => {
    render(<App />)
    expect(screen.getByText('SYNTH')).toBeInTheDocument()
  })

  it('shows the library view with seed tracks by default', () => {
    render(<App />)
    expect(screen.getAllByText(LIBRARY[0].title).length).toBeGreaterThanOrEqual(1)
  })
})
