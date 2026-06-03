import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { usePlayerStore } from '../../store/usePlayerStore'
import SCWidget from '../SCWidget'

const mockWidget = {
  bind: vi.fn(),
  load: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  seekTo: vi.fn(),
  setVolume: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  window.SC = {
    Widget: Object.assign(vi.fn(() => mockWidget), {
      Events: {
        READY: 'ready',
        PLAY: 'play',
        PAUSE: 'pause',
        PLAY_PROGRESS: 'playProgress',
        FINISH: 'finish',
      },
    }),
  }
  usePlayerStore.setState(usePlayerStore.getState().getInitialState())
})

describe('SCWidget', () => {
  it('renders a hidden iframe', () => {
    const { container } = render(<SCWidget />)
    const iframe = container.querySelector('iframe')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveStyle({ display: 'none' })
  })

  it('initializes SC.Widget on mount', () => {
    render(<SCWidget />)
    expect(window.SC.Widget).toHaveBeenCalled()
  })
})
