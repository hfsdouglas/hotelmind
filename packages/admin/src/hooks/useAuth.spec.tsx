import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useAuth } from './useAuth'
import { AuthProvider } from '@/contexts/AuthContext'

function Probe() {
  const { isAuthenticated } = useAuth()
  return <p>{isAuthenticated ? 'authenticated' : 'unauthenticated'}</p>
}

describe('useAuth', () => {
  it('returns context values when used inside AuthProvider', () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(screen.getByText('unauthenticated')).toBeInTheDocument()
  })

  it('throws when used outside AuthProvider', () => {
    const original_error = console.error
    console.error = () => {}
    expect(() => render(<Probe />)).toThrow('useAuth must be used inside AuthProvider')
    console.error = original_error
  })
})
