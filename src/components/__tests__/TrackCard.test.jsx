import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TrackCard from '../TrackCard'

const track = {
  id: '1',
  url: 'https://soundcloud.com/kavinsky/nightcall',
  title: 'Nightcall',
  artist: 'Kavinsky',
  artwork: null,
  color: 'linear-gradient(135deg, #ff6b35, #ff0080)',
}

describe('TrackCard', () => {
  it('renders title and artist', () => {
    render(<TrackCard track={track} onPlay={vi.fn()} />)
    expect(screen.getByText('Nightcall')).toBeInTheDocument()
    expect(screen.getByText('Kavinsky')).toBeInTheDocument()
  })

  it('calls onPlay when clicked', () => {
    const onPlay = vi.fn()
    render(<TrackCard track={track} onPlay={onPlay} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onPlay).toHaveBeenCalledWith(track)
  })

  it('shows playing indicator when isPlaying=true', () => {
    render(<TrackCard track={track} onPlay={vi.fn()} isPlaying />)
    expect(screen.getByText('▶')).toBeInTheDocument()
  })
})
