import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QUARTO_101_ID } from '@/mocks/quartos/quartos_handlers'
import { REGIME_PENSAO_COMPLETA_ID } from '@/mocks/regimes_alimentacao/regimes_alimentacao_handlers'
import { server } from '@/mocks/server'
import { ModalNovaReserva } from './modal_nova_reserva'

const BASE_URL = 'http://localhost:3000'
const VALORES_INICIAIS = { check_in: '2026-12-01', check_out: '2026-12-04' }
const QUARTO_PREFERIDO = { id: QUARTO_101_ID, identificacao: '101' }

function make_props(
  overrides: Partial<React.ComponentProps<typeof ModalNovaReserva>> = {}
) {
  return {
    open: true,
    onOpenChange: vi.fn(),
    valoresIniciais: VALORES_INICIAIS,
    quartoPreferido: QUARTO_PREFERIDO,
    onCreated: vi.fn(),
    ...overrides,
  }
}

function render_modal(props: ReturnType<typeof make_props>) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const tree = (p: ReturnType<typeof make_props>) => (
    <QueryClientProvider client={client}>
      <ModalNovaReserva {...p} />
    </QueryClientProvider>
  )
  const utils = render(tree(props))
  return {
    ...utils,
    rerender_with: (p: ReturnType<typeof make_props>) =>
      utils.rerender(tree(p)),
  }
}

function track_posts() {
  const posts: Record<string, unknown>[] = []
  server.use(
    http.post(`${BASE_URL}/reservas`, async ({ request }) => {
      posts.push((await request.json()) as Record<string, unknown>)
      return HttpResponse.json(
        {
          id: 'reserva-nova',
          codigo: 'RES-0002',
          check_in: '2026-12-01',
          check_out: '2026-12-04',
          quarto_id: QUARTO_101_ID,
        },
        { status: 201 }
      )
    })
  )
  return posts
}

async function fill_and_save(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole('button', { name: /Pensão Completa/ })
  )
  await screen.findByText(/Proposta selecionada: Suíte 101/)
  await user.type(screen.getByLabelText('Nome Completo *'), 'Maria Souza')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))
}

beforeEach(() => {
  vi.spyOn(toast, 'success').mockImplementation(() => 'id')
  vi.spyOn(toast, 'error').mockImplementation(() => 'id')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ModalNovaReserva', () => {
  it('renders a large dialog titled Nova Reserva with Salvar and Cancelar', () => {
    render_modal(make_props())

    const dialog = screen.getByRole('dialog', { name: 'Nova Reserva' })

    expect(dialog).toHaveClass('max-w-6xl')
    expect(dialog).toHaveClass('max-h-[90vh]')
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('keeps the dialog scrollable while hiding its scrollbar', () => {
    render_modal(make_props())

    const dialog = screen.getByRole('dialog', { name: 'Nova Reserva' })

    expect(dialog).toHaveClass('overflow-y-auto')
    expect(dialog).toHaveClass('scrollbar-none')
  })

  it('renders nothing when closed', () => {
    render_modal(make_props({ open: false }))

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('prefills the dates from valoresIniciais', () => {
    render_modal(make_props())

    expect(screen.getByLabelText('Data de Check-in *')).toHaveValue(
      '01/12/2026'
    )
    expect(screen.getByLabelText('Data de Check-out *')).toHaveValue(
      '04/12/2026'
    )
  })

  it('opens with empty dates when there are no initial values', () => {
    render_modal(
      make_props({ valoresIniciais: undefined, quartoPreferido: undefined })
    )

    expect(screen.getByLabelText('Data de Check-in *')).toHaveValue('')
    expect(screen.getByLabelText('Data de Check-out *')).toHaveValue('')
  })

  it('Cancelar asks to close without sending any request', async () => {
    const user = userEvent.setup()
    const posts = track_posts()
    const props = make_props()
    render_modal(props)

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(props.onOpenChange).toHaveBeenCalledWith(false)
    expect(posts).toHaveLength(0)
    expect(props.onCreated).not.toHaveBeenCalled()
  })

  it('shows validation messages and does not post an invalid form', async () => {
    const user = userEvent.setup()
    const posts = track_posts()
    const props = make_props({ quartoPreferido: undefined })
    render_modal(props)

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('Selecione um regime de alimentação.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Selecione uma suíte disponível.')
    ).toBeInTheDocument()
    expect(posts).toHaveLength(0)
    expect(props.onCreated).not.toHaveBeenCalled()
  })

  it('opens with the first regime and the preferred suite already selected, so only the holder is missing', async () => {
    const user = userEvent.setup()
    const posts = track_posts()
    const props = make_props()
    render_modal(props)
    await screen.findByText(/Proposta selecionada: Suíte 101/)

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText(
        'O nome do titular deve ter pelo menos 2 caracteres.'
      )
    ).toBeVisible()
    expect(screen.queryByText('Selecione um regime de alimentação.')).toBeNull()
    expect(screen.queryByText('Selecione uma suíte disponível.')).toBeNull()
    expect(posts).toHaveLength(0)
  })

  it('saves without choosing regime or suite: posts the first regime and the preferred suite without hotel_id', async () => {
    const user = userEvent.setup()
    const posts = track_posts()
    const props = make_props()
    render_modal(props)
    await screen.findByText(/Proposta selecionada: Suíte 101/)
    await user.type(screen.getByLabelText('Nome Completo *'), 'Maria Souza')

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(props.onCreated).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('Selecione um regime de alimentação.')).toBeNull()
    expect(posts[0]).toMatchObject({
      regime_alimentacao_id: REGIME_PENSAO_COMPLETA_ID,
      quarto_id: QUARTO_101_ID,
      titular_nome: 'Maria Souza',
    })
    expect(posts[0]).not.toHaveProperty('hotel_id')
  })

  it('creates the reservation without hotel_id and calls onCreated with the new reservation', async () => {
    const user = userEvent.setup()
    const posts = track_posts()
    const props = make_props()
    render_modal(props)

    await fill_and_save(user)

    await waitFor(() => expect(props.onCreated).toHaveBeenCalledTimes(1))
    expect(props.onCreated).toHaveBeenCalledWith(
      expect.objectContaining({ codigo: 'RES-0002' })
    )
    expect(posts[0]).toMatchObject({
      quarto_id: QUARTO_101_ID,
      check_in: '2026-12-01',
      check_out: '2026-12-04',
      titular_nome: 'Maria Souza',
    })
    expect(posts[0]).not.toHaveProperty('hotel_id')
    expect(toast.success).toHaveBeenCalledWith(
      'Reserva RES-0002 cadastrada com sucesso!'
    )
  })

  it('opens the conflict dialog over the modal on 409', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${BASE_URL}/reservas`, () =>
        HttpResponse.json(
          { message: 'Suíte ocupada no período.', alternativas: [] },
          { status: 409 }
        )
      )
    )
    const props = make_props()
    render_modal(props)

    await fill_and_save(user)

    expect(
      await screen.findByRole('alertdialog', {
        name: 'Suíte com Conflito no Período',
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Suíte ocupada no período.')).toBeInTheDocument()
    expect(props.onCreated).not.toHaveBeenCalled()
  })

  it('keeps the dialog open and shows an error toast on 500', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${BASE_URL}/reservas`, () =>
        HttpResponse.json({ message: 'Falha interna.' }, { status: 500 })
      )
    )
    const props = make_props()
    render_modal(props)

    await fill_and_save(user)

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Falha interna.')
    )
    expect(
      screen.getByRole('dialog', { name: 'Nova Reserva' })
    ).toBeInTheDocument()
    expect(props.onOpenChange).not.toHaveBeenCalled()
    expect(props.onCreated).not.toHaveBeenCalled()
  })

  it('shows a clean form after closing and reopening', async () => {
    const user = userEvent.setup()
    const props = make_props()
    const { rerender_with } = render_modal(props)
    await user.type(screen.getByLabelText('Nome Completo *'), 'Maria Souza')
    expect(screen.getByLabelText('Nome Completo *')).toHaveValue('Maria Souza')

    rerender_with({ ...props, open: false })
    rerender_with({ ...props, open: true })

    expect(await screen.findByLabelText('Nome Completo *')).toHaveValue('')
  })
})
