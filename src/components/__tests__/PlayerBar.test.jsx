import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PlayerBar from '../PlayerBar'

const track = {
  id: '1', title: 'Nightcall', artist: 'Kavinsky', artwork: null,
  color: 'linear-gradient(135deg, #ff6b35, #ff0080)', url: 'https://soundcloud.com/kavinsky/nightcall',
}

const defaultProps = {
  currentTrack: track,
  isPlaying: false,
  progress: 30000,
  duration: 180000,
  volume: 80,
  isLiked: false,
  shuffle: false,
  repeat: 'none',
  onTogglePlay: vi.fn(),
  onNext: vi.fn(),
  onPrev: vi.fn(),
  onSeek: vi.fn(),
  onVolume: vi.fn(),
  onLike: vi.fn(),
  onShuffle: vi.fn(),
  onRepeat: vi.fn(),
}

describe('PlayerBar', () => {
  it('renders track title and artist', () => {
    render(<PlayerBar {...defaultProps} />)
    expect(screen.getByText('Nightcall')).toBeInTheDocument()
    expect(screen.getByText('Kavinsky')).toBeInTheDocument()
  })

  it('calls onTogglePlay when play button clicked', () => {
    const onTogglePlay = vi.fn()
    render(<PlayerBar {...defaultProps} onTogglePlay={onTogglePlay} />)
    fireEvent.click(screen.getByRole('button', { name: /play|pause/i }))
    expect(onTogglePlay).toHaveBeenCalled()
  })

  it('shows pause icon when isPlaying=true', () => {
    render(<PlayerBar {...defaultProps} isPlaying />)
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
  })

  it('calls onNext when next button clicked', () => {
    const onNext = vi.fn()
    render(<PlayerBar {...defaultProps} onNext={onNext} />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalled()
  })

  it('calls onPrev when prev button clicked', () => {
    const onPrev = vi.fn()
    render(<PlayerBar {...defaultProps} onPrev={onPrev} />)
    fireEvent.click(screen.getByRole('button', { name: /prev/i }))
    expect(onPrev).toHaveBeenCalled()
  })

  it('renders empty div when no currentTrack', () => {
    const { container } = render(<PlayerBar {...defaultProps} currentTrack={null} />)
    expect(container.firstChild).toBeEmptyDOMElement()
  })
})
