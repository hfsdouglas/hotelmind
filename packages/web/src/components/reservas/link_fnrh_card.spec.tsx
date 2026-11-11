import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { LinkFnrhCard } from './link_fnrh_card'

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}))
vi.mock('sonner', () => ({ toast }))

const BASE_URL = 'http://localhost:3000'

function renderCard(props: Partial<Parameters<typeof LinkFnrhCard>[0]> = {}) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <LinkFnrhCard
        reservaId="res-1"
        tokenFnrh="token-atual"
        tokenAtivo
        fichasPreenchidas={1}
        totalHospedes={3}
        {...props}
      />
    </QueryClientProvider>
  )
}

describe('LinkFnrhCard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('mostra status ativo e progresso das fichas', () => {
    renderCard()

    expect(screen.getByText('Link Ativo')).toBeInTheDocument()
    expect(screen.getByText('1 de 3 preenchida(s)')).toBeInTheDocument()
    expect(
      screen.queryByText('FNRH enviada pelo cliente à recepção')
    ).not.toBeInTheDocument()
  })

  it('mostra aviso quando a FNRH ja foi enviada pelo cliente', () => {
    renderCard({ fnrhEnviadaEm: '2026-11-01T10:00:00Z' })

    expect(
      screen.getByText('FNRH enviada pelo cliente à recepção')
    ).toBeInTheDocument()
  })

  it('aponta o link de abrir ficha para a url publica do token', () => {
    renderCard()

    expect(screen.getByRole('link', { name: /abrir ficha/i })).toHaveAttribute(
      'href',
      `${window.location.origin}/fnrh/token-atual`
    )
  })

  it('copia o link e exibe toast de sucesso', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /copiar link/i }))

    expect(await navigator.clipboard.readText()).toBe(
      `${window.location.origin}/fnrh/token-atual`
    )
    expect(toast.success).toHaveBeenCalledWith(
      'Link da FNRH copiado para a área de transferência!'
    )
  })

  it('exibe toast de erro quando a copia falha', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(
      new Error('negado')
    )
    renderCard()

    await user.click(screen.getByRole('button', { name: /copiar link/i }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Não foi possível copiar o link automaticamente.'
      )
    )
  })

  it('desabilita copiar e acoes quando nao ha token', () => {
    renderCard({ tokenFnrh: '' })

    expect(screen.getByRole('button', { name: /copiar link/i })).toBeDisabled()
    expect(
      screen.queryByRole('link', { name: /abrir ficha/i })
    ).not.toBeInTheDocument()
  })

  it('desabilita todas as acoes quando disabled', () => {
    renderCard({ disabled: true })

    expect(screen.getByRole('button', { name: /copiar link/i })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /desativar link/i })
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: /regenerar/i })).toBeDisabled()
  })

  it('desativa o link e passa a mostrar status inativo', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /desativar link/i }))

    expect(await screen.findByText('Link Inativo')).toBeInTheDocument()
    expect(toast.info).toHaveBeenCalledWith('Link da FNRH desativado.')
    expect(
      screen.getByRole('button', { name: /reativar \/ novo link/i })
    ).toBeInTheDocument()
  })

  it('exibe toast de erro quando desativar falha', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${BASE_URL}/reservas/:id/link-fnrh/desativar`, () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 })
      )
    )
    renderCard()

    await user.click(screen.getByRole('button', { name: /desativar link/i }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Erro ao desativar link FNRH.')
    )
    expect(screen.getByText('Link Ativo')).toBeInTheDocument()
  })

  it('regenera o link, atualiza a url e reativa o status', async () => {
    const user = userEvent.setup()
    renderCard({ tokenAtivo: false })
    expect(screen.getByText('Link Inativo')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /regenerar/i }))

    expect(await screen.findByText('Link Ativo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /abrir ficha/i })).toHaveAttribute(
      'href',
      `${window.location.origin}/fnrh/novo-token`
    )
    expect(toast.success).toHaveBeenCalledWith(
      'Novo link FNRH gerado com sucesso! O link anterior foi invalidado.'
    )
  })

  it('exibe toast de erro quando regenerar falha', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${BASE_URL}/reservas/:id/link-fnrh/regenerar`, () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 })
      )
    )
    renderCard()

    await user.click(screen.getByRole('button', { name: /regenerar/i }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Erro ao regenerar link FNRH.')
    )
  })
})
