import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ultimo_corpo_alterar_status } from '@/mocks/reservas/reservas_handlers'
import { server } from '@/mocks/server'
import { useCheckInReserva } from './use_check_in_reserva'

const BASE_URL = 'http://localhost:3000'

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const invalidate = vi.spyOn(client, 'invalidateQueries')
  const callbacks = {
    onSucesso: vi.fn(),
    onNaoEncontrada: vi.fn(),
    onTransicaoInvalida: vi.fn(),
  }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const hook = renderHook(() => useCheckInReserva(callbacks), { wrapper })
  return { ...hook, callbacks, invalidate }
}

function was_invalidated(
  invalidate: ReturnType<typeof setup>['invalidate'],
  target: readonly string[]
) {
  return invalidate.mock.calls.some(([filters]) => {
    const key = filters?.queryKey as readonly string[] | undefined
    return !!key && key.every((part, i) => target[i] === part)
  })
}

beforeEach(() => {
  vi.spyOn(toast, 'success').mockImplementation(() => 'id')
  vi.spyOn(toast, 'error').mockImplementation(() => 'id')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useCheckInReserva', () => {
  it('sends only { status: "check_in" }, toasts, calls onSucesso and invalidates the queries', async () => {
    const { result, callbacks, invalidate } = setup()

    act(() =>
      result.current.realizarCheckIn({ id: 'reserva-101', codigo: 'RES-0101' })
    )

    await waitFor(() => expect(callbacks.onSucesso).toHaveBeenCalledTimes(1))
    expect(ultimo_corpo_alterar_status()).toEqual({ status: 'check_in' })
    expect(toast.success).toHaveBeenCalledWith(
      'Check-in da reserva RES-0101 realizado com sucesso!'
    )
    expect(callbacks.onSucesso.mock.calls[0][0]).toMatchObject({
      id: 'reserva-101',
      status: 'check_in',
    })
    expect(was_invalidated(invalidate, ['reservas', 'calendario'])).toBe(true)
    expect(was_invalidated(invalidate, ['reserva', 'reserva-101'])).toBe(true)
  })

  it('reports isPending while the request is in flight', async () => {
    let release: () => void = () => {}
    const gate = new Promise<void>(resolve => {
      release = resolve
    })
    server.use(
      http.patch(`${BASE_URL}/reservas/:id/status`, async () => {
        await gate
        return HttpResponse.json({ id: 'reserva-101', status: 'check_in' })
      })
    )
    const { result } = setup()
    expect(result.current.isPending).toBe(false)

    act(() =>
      result.current.realizarCheckIn({ id: 'reserva-101', codigo: 'RES-0101' })
    )

    await waitFor(() => expect(result.current.isPending).toBe(true))
    release()
    await waitFor(() => expect(result.current.isPending).toBe(false))
  })

  it('shows the API message and calls onTransicaoInvalida on 422', async () => {
    const { result, callbacks } = setup()

    act(() =>
      result.current.realizarCheckIn({ id: 'reserva-103', codigo: 'RES-0103' })
    )

    await waitFor(() =>
      expect(callbacks.onTransicaoInvalida).toHaveBeenCalledTimes(1)
    )
    expect(toast.error).toHaveBeenCalledWith(
      'Transição de status inválida: a_confirmar → check_in'
    )
    expect(callbacks.onSucesso).not.toHaveBeenCalled()
    expect(callbacks.onNaoEncontrada).not.toHaveBeenCalled()
  })

  it('falls back to a generic message on 422 without message', async () => {
    server.use(
      http.patch(`${BASE_URL}/reservas/:id/status`, () =>
        HttpResponse.json({}, { status: 422 })
      )
    )
    const { result, callbacks } = setup()

    act(() =>
      result.current.realizarCheckIn({ id: 'reserva-103', codigo: 'RES-0103' })
    )

    await waitFor(() =>
      expect(callbacks.onTransicaoInvalida).toHaveBeenCalledTimes(1)
    )
    expect(toast.error).toHaveBeenCalledWith(
      'Não foi possível realizar o check-in.'
    )
  })

  it('shows "Reserva não encontrada." and calls onNaoEncontrada on 404', async () => {
    const { result, callbacks } = setup()

    act(() =>
      result.current.realizarCheckIn({ id: 'inexistente', codigo: 'RES-9999' })
    )

    await waitFor(() =>
      expect(callbacks.onNaoEncontrada).toHaveBeenCalledTimes(1)
    )
    expect(toast.error).toHaveBeenCalledWith('Reserva não encontrada.')
    expect(callbacks.onSucesso).not.toHaveBeenCalled()
    expect(callbacks.onTransicaoInvalida).not.toHaveBeenCalled()
  })

  it('toasts an error and calls no callback on 500', async () => {
    server.use(
      http.patch(`${BASE_URL}/reservas/:id/status`, () =>
        HttpResponse.json({ message: 'Falha interna' }, { status: 500 })
      )
    )
    const { result, callbacks } = setup()

    act(() =>
      result.current.realizarCheckIn({ id: 'reserva-101', codigo: 'RES-0101' })
    )

    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1))
    expect(callbacks.onSucesso).not.toHaveBeenCalled()
    expect(callbacks.onNaoEncontrada).not.toHaveBeenCalled()
    expect(callbacks.onTransicaoInvalida).not.toHaveBeenCalled()
  })
})
