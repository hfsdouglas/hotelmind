import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrcamentoAcoesCompartilhamento } from './orcamento_acoes_compartilhamento'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('OrcamentoAcoesCompartilhamento', () => {
  const writeTextMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock.mockResolvedValue(undefined),
      },
    })
  })

  it('renders sharing action buttons in default mode', () => {
    render(
      <MemoryRouter>
        <OrcamentoAcoesCompartilhamento
          token_publico="tok-test-123"
          lead_nome="Carlos Silva"
          lead_email="carlos@exemplo.com"
          lead_telefone="11999990000"
          valor_total="450.00"
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Copiar Link')).toBeInTheDocument()
    expect(screen.getByText('Enviar E-mail')).toBeInTheDocument()
    expect(screen.getByText('Enviar WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Ver Proposta')).toBeInTheDocument()
  })

  it('copies public url to clipboard on button click', async () => {
    render(
      <MemoryRouter>
        <OrcamentoAcoesCompartilhamento
          token_publico="tok-test-123"
          lead_nome="Carlos Silva"
          lead_email="carlos@exemplo.com"
          lead_telefone="11999990000"
        />
      </MemoryRouter>
    )

    const copyBtn = screen.getByText('Copiar Link')
    fireEvent.click(copyBtn)

    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining('/orcamento/tok-test-123')
    )
    expect(toast.success).toHaveBeenCalledWith(
      'Link de visualização copiado para a área de transferência!'
    )
  })

  it('simulates sending email when lead email is provided', () => {
    render(
      <MemoryRouter>
        <OrcamentoAcoesCompartilhamento
          token_publico="tok-test-123"
          lead_email="carlos@exemplo.com"
        />
      </MemoryRouter>
    )

    const emailBtn = screen.getByText('Enviar E-mail')
    fireEvent.click(emailBtn)

    expect(toast.info).toHaveBeenCalledWith(
      expect.stringContaining('carlos@exemplo.com')
    )
  })

  it('shows error when sending email if email is missing', () => {
    render(
      <MemoryRouter>
        <OrcamentoAcoesCompartilhamento token_publico="tok-test-123" />
      </MemoryRouter>
    )

    const emailBtn = screen.getByText('Enviar E-mail')
    fireEvent.click(emailBtn)

    expect(toast.error).toHaveBeenCalledWith(
      'Este orçamento não possui e-mail de lead cadastrado.'
    )
  })

  it('simulates sending whatsapp when lead phone is provided', () => {
    render(
      <MemoryRouter>
        <OrcamentoAcoesCompartilhamento
          token_publico="tok-test-123"
          lead_telefone="11999990000"
        />
      </MemoryRouter>
    )

    const waBtn = screen.getByText('Enviar WhatsApp')
    fireEvent.click(waBtn)

    expect(toast.info).toHaveBeenCalledWith(
      expect.stringContaining('11999990000')
    )
  })

  it('shows error when sending whatsapp if phone is missing', () => {
    render(
      <MemoryRouter>
        <OrcamentoAcoesCompartilhamento token_publico="tok-test-123" />
      </MemoryRouter>
    )

    const waBtn = screen.getByText('Enviar WhatsApp')
    fireEvent.click(waBtn)

    expect(toast.error).toHaveBeenCalledWith(
      'Este orçamento não possui celular/WhatsApp de lead cadastrado.'
    )
  })

  it('renders icon buttons with titles in compact mode', () => {
    render(
      <MemoryRouter>
        <OrcamentoAcoesCompartilhamento
          token_publico="tok-test-123"
          lead_nome="Carlos Silva"
          compact
        />
      </MemoryRouter>
    )

    expect(
      screen.getByTitle('Copiar link da página pública')
    ).toBeInTheDocument()
    expect(screen.getByTitle('Simular envio por e-mail')).toBeInTheDocument()
    expect(
      screen.getByTitle('Simular envio de texto no WhatsApp')
    ).toBeInTheDocument()
    expect(
      screen.getByTitle('Abrir página pública do lead')
    ).toBeInTheDocument()
  })
})
