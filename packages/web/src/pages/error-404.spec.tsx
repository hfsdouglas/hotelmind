import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Error404Page } from './error-404'

describe('Error404Page', () => {
  it('renders 404 message and link back to home', () => {
    render(
      <MemoryRouter>
        <Error404Page />
      </MemoryRouter>
    )

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Voltar ao início' })
    ).toBeInTheDocument()
  })
})
