import type { QuartoDisponivel } from '@hotelmind/contracts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QUARTO_101_ID, QUARTO_102_ID } from '@/mocks/quartos/quartos_handlers'
import { REGIME_PENSAO_COMPLETA_ID } from '@/mocks/regimes_alimentacao/regimes_alimentacao_handlers'
import { server } from '@/mocks/server'
import { useNovaReservaForm } from './use_nova_reserva_form'

const BASE_URL = 'http://localhost:3000'
const PARCEIRO_ID = '00000000-0000-4000-8000-0000000000b1'

let query_client: QueryClient

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={query_client}>{children}</QueryClientProvider>
  )
}

function render_form(
  options: Partial<Parameters<typeof useNovaReservaForm>[0]> = {}
) {
  const onSuccess = vi.fn()
  const hook = renderHook(() => useNovaReservaForm({ onSuccess, ...options }), {
    wrapper,
  })
  return { ...hook, onSuccess }
}

function fill_valid_form(
  result: ReturnType<typeof render_form>['result'],
  overrides: Record<string, unknown> = {}
) {
  const values: Record<string, unknown> = {
    check_in: '2026-12-01',
    check_out: '2026-12-04',
    regime_alimentacao_id: REGIME_PENSAO_COMPLETA_ID,
    quarto_id: QUARTO_101_ID,
    titular_nome: 'Maria Souza',
    titular_telefone: '(11) 99999-8888',
    ...overrides,
  }
  act(() => {
    for (const [name, value] of Object.entries(values)) {
      // biome-ignore lint/suspicious/noExplicitAny: dynamic field names in test helper
      result.current.form.setValue(name as any, value as any)
    }
  })
}

function capture_post_body() {
  const captured: { body?: Record<string, unknown> } = {}
  server.use(
    http.post(`${BASE_URL}/reservas`, async ({ request }) => {
      captured.body = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(
        { id: 'reserva-nova', codigo: 'RES-0002' },
        { status: 201 }
      )
    })
  )
  return captured
}

beforeEach(() => {
  query_client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  vi.spyOn(toast, 'success').mockImplementation(() => 'id')
  vi.spyOn(toast, 'error').mockImplementation(() => 'id')
  vi.spyOn(toast, 'info').mockImplementation(() => 'id')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useNovaReservaForm - default values', () => {
  it('starts with the page defaults', () => {
    const { result } = render_form()

    expect(result.current.form.getValues()).toMatchObject({
      check_in: '',
      check_out: '',
      quantidade_adultos: 2,
      quantidade_criancas: 0,
      quantidade_pets: 0,
      regime_alimentacao_id: '',
      quarto_id: '',
      titular_nome: '',
    })
    expect(result.current.isPending).toBe(false)
    expect(result.current.conflito.open).toBe(false)
  })

  it('merges valoresIniciais over the defaults', () => {
    const { result } = render_form({
      valoresIniciais: { check_in: '2026-12-01', check_out: '2026-12-04' },
    })

    expect(result.current.form.getValues()).toMatchObject({
      check_in: '2026-12-01',
      check_out: '2026-12-04',
      quantidade_adultos: 2,
      quantidade_criancas: 0,
    })
  })
})

describe('useNovaReservaForm - submit', () => {
  it('sends the mapped payload without hotel_id, then toasts, invalidates and calls onSuccess', async () => {
    const captured = capture_post_body()
    const invalidate = vi.spyOn(query_client, 'invalidateQueries')
    const { result, onSuccess } = render_form()
    fill_valid_form(result, {
      titular_email: 'maria@example.com',
      cupom_desconto: '  PROMO10  ',
      parceiro_comercial_id: '',
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(captured.body).toEqual({
      titular_nome: 'Maria Souza',
      titular_telefone: '11999998888',
      titular_email: 'maria@example.com',
      quarto_id: QUARTO_101_ID,
      regime_alimentacao_id: REGIME_PENSAO_COMPLETA_ID,
      parceiro_comercial_id: null,
      check_in: '2026-12-01',
      check_out: '2026-12-04',
      quantidade_adultos: 2,
      quantidade_criancas: 0,
      quantidade_pets: 0,
      cupom_desconto: 'PROMO10',
      observacoes: null,
    })
    expect(captured.body).not.toHaveProperty('hotel_id')
    expect(toast.success).toHaveBeenCalledWith(
      'Reserva RES-0002 cadastrada com sucesso!'
    )
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['reservas'] })
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'reserva-nova', codigo: 'RES-0002' })
    )
  })

  it('sends null for an empty coupon and the partner id when chosen', async () => {
    const captured = capture_post_body()
    const { result, onSuccess } = render_form()
    fill_valid_form(result, {
      cupom_desconto: '   ',
      parceiro_comercial_id: PARCEIRO_ID,
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(captured.body?.cupom_desconto).toBeNull()
    expect(captured.body?.parceiro_comercial_id).toBe(PARCEIRO_ID)
  })

  it('does not send anything when the form is invalid', async () => {
    const captured = capture_post_body()
    const { result, onSuccess } = render_form()

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(captured.body).toBeUndefined()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(
      result.current.form.formState.errors.regime_alimentacao_id?.message
    ).toBe('Selecione um regime de alimentação.')
    expect(result.current.form.formState.errors.quarto_id?.message).toBe(
      'Selecione uma suíte disponível.'
    )
  })
})

describe('useNovaReservaForm - errors', () => {
  it('opens the conflict state with message and alternatives on 409', async () => {
    const alternativas: QuartoDisponivel[] = [
      {
        quarto_id: QUARTO_102_ID,
        identificacao: '102',
        categoria_nome: 'Suíte Luxo',
        limite_hospedes: 3,
        valor_total: '900.00',
      },
    ]
    server.use(
      http.post(`${BASE_URL}/reservas`, () =>
        HttpResponse.json(
          { message: 'Suíte ocupada no período.', alternativas },
          { status: 409 }
        )
      )
    )
    const { result, onSuccess } = render_form()
    fill_valid_form(result)

    await act(async () => {
      await result.current.onSubmit()
    })

    await waitFor(() => expect(result.current.conflito.open).toBe(true))
    expect(result.current.conflito.mensagem).toBe('Suíte ocupada no período.')
    expect(result.current.conflito.alternativas).toEqual(alternativas)
    expect(onSuccess).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('falls back to the default conflict message', async () => {
    server.use(
      http.post(`${BASE_URL}/reservas`, () =>
        HttpResponse.json({}, { status: 409 })
      )
    )
    const { result } = render_form()
    fill_valid_form(result)

    await act(async () => {
      await result.current.onSubmit()
    })

    await waitFor(() => expect(result.current.conflito.open).toBe(true))
    expect(result.current.conflito.mensagem).toBe(
      'A suíte selecionada já possui reserva no período.'
    )
    expect(result.current.conflito.alternativas).toEqual([])
  })

  it('shows the API message in an error toast on other failures', async () => {
    server.use(
      http.post(`${BASE_URL}/reservas`, () =>
        HttpResponse.json({ message: 'Falha interna.' }, { status: 500 })
      )
    )
    const { result, onSuccess } = render_form()
    fill_valid_form(result)

    await act(async () => {
      await result.current.onSubmit()
    })

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Falha interna.')
    )
    expect(onSuccess).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
    expect(result.current.conflito.open).toBe(false)
  })

  it('uses the generic error toast when the API sends no message', async () => {
    server.use(
      http.post(`${BASE_URL}/reservas`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    )
    const { result } = render_form()
    fill_valid_form(result)

    await act(async () => {
      await result.current.onSubmit()
    })

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Erro ao cadastrar reserva.')
    )
  })
})

describe('useNovaReservaForm - conflict alternatives', () => {
  it('selecionarAlternativa sets the suite, closes the conflict and announces it', async () => {
    server.use(
      http.post(`${BASE_URL}/reservas`, () =>
        HttpResponse.json(
          { message: 'Suíte ocupada.', alternativas: [] },
          { status: 409 }
        )
      )
    )
    const { result } = render_form()
    fill_valid_form(result)
    await act(async () => {
      await result.current.onSubmit()
    })
    await waitFor(() => expect(result.current.conflito.open).toBe(true))

    act(() =>
      result.current.selecionarAlternativa({
        quarto_id: QUARTO_102_ID,
        identificacao: '102',
        categoria_nome: 'Suíte Luxo',
        limite_hospedes: 3,
        valor_total: '900.00',
      })
    )

    expect(result.current.form.getValues('quarto_id')).toBe(QUARTO_102_ID)
    expect(result.current.conflito.open).toBe(false)
    expect(toast.info).toHaveBeenCalledWith(
      'Suíte 102 selecionada como alternativa.'
    )
  })

  it('fecharConflito closes the conflict state', async () => {
    server.use(
      http.post(`${BASE_URL}/reservas`, () =>
        HttpResponse.json({ message: 'Suíte ocupada.' }, { status: 409 })
      )
    )
    const { result } = render_form()
    fill_valid_form(result)
    await act(async () => {
      await result.current.onSubmit()
    })
    await waitFor(() => expect(result.current.conflito.open).toBe(true))

    act(() => result.current.fecharConflito())

    expect(result.current.conflito.open).toBe(false)
  })
})
