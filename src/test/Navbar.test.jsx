import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import Navbar from '../components/Navbar.jsx'

// Mock the components that Navbar depends on
vi.mock('../components/SearchBar.jsx', () => ({
  default: () => <div data-testid="search-bar">Search Bar</div>
}))

vi.mock('../components/AvatarMenu.jsx', () => ({
  default: () => <div data-testid="avatar-menu">Avatar Menu</div>
}))

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Navbar', () => {
  it('renders Lunarly branding', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByText('Lunarly')).toBeInTheDocument()
  })

  it('renders search bar', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
  })

  it('renders avatar menu', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByTestId('avatar-menu')).toBeInTheDocument()
  })
})
