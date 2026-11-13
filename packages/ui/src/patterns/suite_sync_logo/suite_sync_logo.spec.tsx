import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SuiteSyncLogo } from './suite_sync_logo'

describe('SuiteSyncLogo', () => {
  it('renders hotel icon and SuiteSync wordmark by default', () => {
    const { container } = render(<SuiteSyncLogo />)

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('Suite')).toBeInTheDocument()
    expect(screen.getByText('Sync')).toBeInTheDocument()
  })

  it('hides wordmark when iconOnly is true', () => {
    const { container } = render(<SuiteSyncLogo iconOnly />)

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.queryByText('Suite')).not.toBeInTheDocument()
    expect(screen.queryByText('Sync')).not.toBeInTheDocument()
  })

  it('renders optional badge when provided', () => {
    render(<SuiteSyncLogo badge="ADMIN" />)

    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })
})
