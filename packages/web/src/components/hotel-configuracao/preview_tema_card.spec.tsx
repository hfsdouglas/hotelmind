import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PreviewTemaCard } from './preview_tema_card'

describe('PreviewTemaCard', () => {
  const baseProps = {
    nomeHotel: 'Hotel Teste',
    corPrimaria: '#1e40af',
    corSecundaria: '#64748b',
    corFundo: '#ffffff',
    corSuperficie: '#f8fafc',
    corTextoPrincipal: '#0f172a',
    corTextoSecundario: '#475569',
    corDestaque: '#f59e0b',
  }

  it('renders hotel name and applies live styles', () => {
    render(<PreviewTemaCard {...baseProps} />)

    expect(screen.getByText('Hotel Teste')).toBeInTheDocument()
    const container = screen.getByTestId('preview-container')
    expect(container).toHaveStyle({
      backgroundColor: '#ffffff',
      color: '#0f172a',
    })
  })

  it('renders logo image when logoUrl is provided', () => {
    render(
      <PreviewTemaCard {...baseProps} logoUrl="https://example.com/logo.png" />
    )

    const img = screen.getByRole('img', { name: /logo preview/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/logo.png')
  })
})
