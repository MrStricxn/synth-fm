import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'
import { usePlayerStore } from '../store/usePlayerStore'

beforeEach(() => {
  // Provide a minimal SC mock so SCWidget doesn't blow up
  const mockWidget = { bind: vi.fn(), load: vi.fn(), play: vi.fn(), pause: vi.fn(), seekTo: vi.fn(), setVolume: vi.fn() }
  window.SC = {
    Widget: Object.assign(vi.fn(() => mockWidget), {
      Events: { READY: 'ready', PLAY: 'play', PAUSE: 'pause', PLAY_PROGRESS: 'playProgress', FINISH: 'finish' },
    }),
  }
  usePlayerStore.setState(usePlayerStore.getState().getInitialState())
})

describe('App integration', () => {
  it('renders the full app without crashing', () => {
    render(<App />)
    expect(screen.getByText('SYNTH')).toBeInTheDocument()
  })

  it('shows the library view with tracks by default', () => {
    render(<App />)
    expect(screen.getAllByText('Nightcall').length).toBeGreaterThanOrEqual(1)
  })
})
