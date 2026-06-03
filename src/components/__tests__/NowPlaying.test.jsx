import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import NowPlaying from '../NowPlaying'
import { usePlayerStore } from '../../store/usePlayerStore'
import { LIBRARY } from '../../data/library'

beforeEach(() => {
  usePlayerStore.setState(usePlayerStore.getState().getInitialState())
})

describe('NowPlaying', () => {
  it('renders nothing when not fullscreen', () => {
    const { container } = render(<NowPlaying />)
    expect(container.firstChild).toBeNull()
  })

  it('reacts to store progress updates while open', () => {
    usePlayerStore.setState({
      fullscreen: true,
      currentTrack: LIBRARY[0],
      duration: 180000,
      progress: 30000,
    })
    render(<NowPlaying />)
    expect(screen.getByText('0:30')).toBeInTheDocument()

    act(() => {
      usePlayerStore.getState().setProgress(60000, 180000)
    })
    expect(screen.getByText('1:00')).toBeInTheDocument()
  })
})
