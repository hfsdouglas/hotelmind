import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ModalPreviewTema } from './modal_preview_tema'

describe('ModalPreviewTema', () => {
  const baseProps = {
    nomeHotel: 'Hotel Teste Modal',
    corPrimaria: '#1e40af',
    corSecundaria: '#64748b',
    corFundo: '#ffffff',
    corSuperficie: '#f8fafc',
    corTextoPrincipal: '#0f172a',
    corTextoSecundario: '#475569',
    corDestaque: '#f59e0b',
  }

  it('renders modal content when open is true', () => {
    render(
      <ModalPreviewTema open={true} onOpenChange={() => {}} {...baseProps} />
    )

    expect(screen.getByText('Prévia da Identidade Visual')).toBeInTheDocument()
    expect(screen.getByText('Hotel Teste Modal')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fechar/i })).toBeInTheDocument()
  })

  it('does not render dialog content when open is false', () => {
    render(
      <ModalPreviewTema open={false} onOpenChange={() => {}} {...baseProps} />
    )

    expect(
      screen.queryByText('Prévia da Identidade Visual')
    ).not.toBeInTheDocument()
  })
})
