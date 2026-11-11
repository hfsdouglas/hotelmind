import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import {
  useHotelConfiguracao,
  useUpdateHotelConfiguracaoMutation,
} from './use_hotel_configuracao'

const URL = 'http://localhost:3000/hoteis/configuracao'

function setup<T>(hook: () => T) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, ...renderHook(hook, { wrapper }) }
}

describe('useHotelConfiguracao', () => {
  it('carrega a configuração do hotel autenticado', async () => {
    server.use(http.get(URL, () => HttpResponse.json({ hotel_id: 'hotel-A' })))
    const { result } = setup(() => useHotelConfiguracao())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ hotel_id: 'hotel-A' })
  })

  it('expõe erro quando a API falha', async () => {
    server.use(
      http.get(URL, () => HttpResponse.json({ message: 'x' }, { status: 500 }))
    )
    const { result } = setup(() => useHotelConfiguracao())

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useUpdateHotelConfiguracaoMutation', () => {
  it('envia a atualização e invalida a query de configuração', async () => {
    let body: unknown
    server.use(
      http.put(URL, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ hotel_id: 'hotel-A' })
      })
    )
    const { result, client } = setup(() => useUpdateHotelConfiguracaoMutation())
    client.setQueryData(['hotel-configuracao'], { hotel_id: 'hotel-A' })

    result.current.mutate({ checkin_padrao: '14:00' } as never)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(body).toEqual({ checkin_padrao: '14:00' })
    expect(client.getQueryState(['hotel-configuracao'])?.isInvalidated).toBe(
      true
    )
  })

  it('expõe erro quando a atualização falha', async () => {
    server.use(
      http.put(URL, () => HttpResponse.json({ message: 'x' }, { status: 422 }))
    )
    const { result } = setup(() => useUpdateHotelConfiguracaoMutation())

    result.current.mutate({} as never)

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
