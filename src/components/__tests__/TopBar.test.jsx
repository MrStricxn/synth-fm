import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TopBar from '../TopBar'

describe('TopBar', () => {
  it('renders SYNTH.FM logo', () => {
    render(<TopBar searchQuery="" onSearch={vi.fn()} />)
    expect(screen.getByText('SYNTH')).toBeInTheDocument()
    expect(screen.getByText('.FM')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<TopBar searchQuery="" onSearch={vi.fn()} />)
    expect(screen.getByPlaceholderText(/исполнитель/i)).toBeInTheDocument()
  })

  it('calls onSearch when input changes', () => {
    const onSearch = vi.fn()
    render(<TopBar searchQuery="" onSearch={onSearch} />)
    fireEvent.change(screen.getByPlaceholderText(/исполнитель/i), { target: { value: 'kavinsky' } })
    expect(onSearch).toHaveBeenCalledWith('kavinsky')
  })

  it('shows current searchQuery value', () => {
    render(<TopBar searchQuery="kavinsky" onSearch={vi.fn()} />)
    expect(screen.getByDisplayValue('kavinsky')).toBeInTheDocument()
  })
})
