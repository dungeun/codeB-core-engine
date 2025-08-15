import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import HomePage from '../HomePage'
import '@testing-library/jest-dom'

// Mock the child components
jest.mock('../home/AutoSlideBanner', () => ({
  __esModule: true,
  default: () => <div data-testid="auto-slide-banner">AutoSlideBanner</div>,
}))

jest.mock('../home/HomeSections', () => ({
  __esModule: true,
  default: () => <div data-testid="home-sections">HomeSections</div>,
}))

// Mock the API call
global.fetch = jest.fn()

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves to keep loading state
    )

    render(<HomePage />)
    
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()
  })

  it('renders components after loading site settings', async () => {
    const mockSettings = {
      siteName: 'Test Site',
      siteDescription: 'Test Description',
      contactEmail: 'test@example.com',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSettings,
    })

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByTestId('auto-slide-banner')).toBeInTheDocument()
      expect(screen.getByTestId('home-sections')).toBeInTheDocument()
    })
  })

  it('handles API error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('API Error')
    )

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByTestId('auto-slide-banner')).toBeInTheDocument()
      expect(screen.getByTestId('home-sections')).toBeInTheDocument()
    })
  })

  it('handles non-ok response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByTestId('auto-slide-banner')).toBeInTheDocument()
      expect(screen.getByTestId('home-sections')).toBeInTheDocument()
    })
  })
})