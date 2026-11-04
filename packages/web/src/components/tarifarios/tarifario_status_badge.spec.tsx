import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TarifarioStatusBadge } from './tarifario_status_badge'

describe('TarifarioStatusBadge', () => {
  it('renders Ativo badge when ativo is true', () => {
    render(<TarifarioStatusBadge ativo={true} />)
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('renders Inativo badge when ativo is false', () => {
    render(<TarifarioStatusBadge ativo={false} />)
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })
})
