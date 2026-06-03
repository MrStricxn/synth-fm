import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '../Sidebar'

const playlists = [
  { id: 'p1', name: 'Synthwave Mix', tracks: [] },
  { id: 'p2', name: 'Retrowave 80s', tracks: [] },
]

describe('Sidebar', () => {
  it('renders all nav items', () => {
    render(<Sidebar activeView="library" playlists={[]} onNav={vi.fn()} onNewPlaylist={vi.fn()} />)
    expect(screen.getByText(/library/i)).toBeInTheDocument()
    expect(screen.getByText(/playlists/i)).toBeInTheDocument()
    expect(screen.getByText(/discover/i)).toBeInTheDocument()
    expect(screen.getByText(/liked/i)).toBeInTheDocument()
  })

  it('calls onNav with correct view when nav item clicked', () => {
    const onNav = vi.fn()
    render(<Sidebar activeView="library" playlists={[]} onNav={onNav} onNewPlaylist={vi.fn()} />)
    fireEvent.click(screen.getByText(/liked/i))
    expect(onNav).toHaveBeenCalledWith('liked', null)
  })

  it('renders playlists', () => {
    render(<Sidebar activeView="library" playlists={playlists} onNav={vi.fn()} onNewPlaylist={vi.fn()} />)
    expect(screen.getByText('Synthwave Mix')).toBeInTheDocument()
    expect(screen.getByText('Retrowave 80s')).toBeInTheDocument()
  })

  it('calls onNav with playlist id when playlist clicked', () => {
    const onNav = vi.fn()
    render(<Sidebar activeView="library" playlists={playlists} onNav={onNav} onNewPlaylist={vi.fn()} />)
    fireEvent.click(screen.getByText('Synthwave Mix'))
    expect(onNav).toHaveBeenCalledWith('playlists', 'p1')
  })

  it('calls onNewPlaylist when + button clicked', () => {
    const onNewPlaylist = vi.fn()
    render(<Sidebar activeView="library" playlists={[]} onNav={vi.fn()} onNewPlaylist={onNewPlaylist} />)
    fireEvent.click(screen.getByRole('button', { name: /new playlist/i }))
    expect(onNewPlaylist).toHaveBeenCalled()
  })
})
