import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LibraryView from '../LibraryView'
import { LIBRARY } from '../../../data/library'

const props = {
  tracks: LIBRARY,
  currentTrack: null,
  isPlaying: false,
  onPlay: vi.fn(),
  onLike: vi.fn(),
  isLiked: vi.fn(() => false),
}

describe('LibraryView', () => {
  it('renders library heading', () => {
    render(<LibraryView {...props} />)
    expect(screen.getByText(/коллекци/i)).toBeInTheDocument()
  })

  it('renders TrackCards for tracks in grid', () => {
    render(<LibraryView {...props} />)
    expect(screen.getAllByText('Nightcall').length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when tracks is empty', () => {
    render(<LibraryView {...props} tracks={[]} />)
    expect(screen.getByText(/не найдено/i)).toBeInTheDocument()
  })
})
