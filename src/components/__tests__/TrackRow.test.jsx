import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TrackRow from '../TrackRow'

const track = {
  id: '1', url: 'https://soundcloud.com/kavinsky/nightcall',
  title: 'Nightcall', artist: 'Kavinsky', artwork: null,
  color: 'linear-gradient(135deg, #ff6b35, #ff0080)',
}

describe('TrackRow', () => {
  it('renders title, artist', () => {
    render(<TrackRow track={track} index={0} onPlay={vi.fn()} onLike={vi.fn()} isLiked={false} />)
    expect(screen.getByText('Nightcall')).toBeInTheDocument()
    expect(screen.getByText('Kavinsky')).toBeInTheDocument()
  })

  it('shows index+1 when not active', () => {
    render(<TrackRow track={track} index={2} onPlay={vi.fn()} onLike={vi.fn()} isLiked={false} />)
    expect(screen.getByText('03')).toBeInTheDocument()
  })

  it('calls onPlay when row is clicked', () => {
    const onPlay = vi.fn()
    render(<TrackRow track={track} index={0} onPlay={onPlay} onLike={vi.fn()} isLiked={false} />)
    fireEvent.click(screen.getByText('Nightcall'))
    expect(onPlay).toHaveBeenCalledWith(track)
  })

  it('calls onLike when heart button clicked', () => {
    const onLike = vi.fn()
    render(<TrackRow track={track} index={0} onPlay={vi.fn()} onLike={onLike} isLiked={false} />)
    fireEvent.click(screen.getByRole('button', { name: /like/i }))
    expect(onLike).toHaveBeenCalledWith(track)
  })

  it('shows filled heart when isLiked=true', () => {
    render(<TrackRow track={track} index={0} onPlay={vi.fn()} onLike={vi.fn()} isLiked />)
    expect(screen.getByRole('button', { name: /like/i })).toHaveAttribute('data-liked', 'true')
  })

  it('shows play indicator when isActive=true', () => {
    render(<TrackRow track={track} index={0} onPlay={vi.fn()} onLike={vi.fn()} isLiked={false} isActive />)
    expect(screen.getByText('▶')).toBeInTheDocument()
  })
})
