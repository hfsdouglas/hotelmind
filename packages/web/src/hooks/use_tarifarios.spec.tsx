import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import {
  useActivateTarifarioMutation,
  useCreateTarifarioMutation,
  useDeactivateTarifarioMutation,
  useTarifario,
  useTarifariosCalendario,
  useTarifariosList,
  useUpdateTarifarioMutation,
} from './use_tarifarios'

const BASE = 'http://localhost:3000/tarifarios'

function setup<T>(hook: () => T) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, ...renderHook(hook, { wrapper }) }
}

const range = { data_inicio: '2026-01-01', data_fim: '2026-01-31' }

describe('useTarifariosList', () => {
  it('lista tarifários repassando parâmetros de paginação e busca', async () => {
    let search = ''
    server.use(
      http.get(BASE, ({ request }) => {
        search = new URL(request.url).search
        return HttpResponse.json({
          data: [{ id: 't1' }],
          meta: { pagina: 2, limite: 50, total: 1, ultima_pagina: 1 },
        })
      })
    )
    const { result } = setup(() =>
      useTarifariosList({ pagina: 2, busca: 'alta' } as never)
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
    expect(search).toContain('pagina=2')
    expect(search).toContain('busca=alta')
  })

  it('expõe erro quando a API falha', async () => {
    server.use(http.get(BASE, () => HttpResponse.json({}, { status: 500 })))
    const { result } = setup(() => useTarifariosList())

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useTarifario', () => {
  it('carrega um tarifário pelo id', async () => {
    server.use(http.get(`${BASE}/t1`, () => HttpResponse.json({ id: 't1' })))
    const { result } = setup(() => useTarifario('t1'))

    await waitFor(() => expect(result.current.data).toMatchObject({ id: 't1' }))
  })

  it('não consulta quando o id é vazio', () => {
    const { result } = setup(() => useTarifario(''))

    expect(result.current.fetchStatus).toBe('idle')
  })

  it('retorna erro quando o tarifário pertence a outro hotel (404)', async () => {
    server.use(
      http.get(`${BASE}/t-outro-hotel`, () =>
        HttpResponse.json({ message: 'não encontrado' }, { status: 404 })
      )
    )
    const { result } = setup(() => useTarifario('t-outro-hotel'))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})

describe('useTarifariosCalendario', () => {
  it('não consulta sem categoria de quarto', () => {
    const { result } = setup(() =>
      useTarifariosCalendario({ categoria_quarto_id: '', ...range })
    )

    expect(result.current.fetchStatus).toBe('idle')
  })

  it('faz uma única consulta com uma categoria', async () => {
    const calls: string[] = []
    server.use(
      http.get(`${BASE}/calendario`, ({ request }) => {
        calls.push(
          new URL(request.url).searchParams.get('categoria_quarto_id') ?? ''
        )
        return HttpResponse.json({ data: [{ id: 'p1' }] })
      })
    )
    const { result } = setup(() =>
      useTarifariosCalendario({ categoria_quarto_id: 'c1', ...range })
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(calls).toEqual(['c1'])
    expect(result.current.data?.data).toEqual([{ id: 'p1' }])
  })

  it('consulta cada categoria e remove períodos duplicados por id', async () => {
    server.use(
      http.get(`${BASE}/calendario`, ({ request }) => {
        const cat = new URL(request.url).searchParams.get('categoria_quarto_id')
        return HttpResponse.json({
          data: [{ id: 'comum' }, { id: `so_${cat}` }],
        })
      })
    )
    const { result } = setup(() =>
      useTarifariosCalendario({
        categoria_quarto_id: '',
        categoria_quarto_ids: ['c1', 'c2'],
        ...range,
      })
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.map(p => p.id)).toEqual([
      'comum',
      'so_c1',
      'so_c2',
    ])
  })
})

describe('mutations de tarifário', () => {
  function expectInvalidated(client: QueryClient, keys: unknown[][]) {
    for (const key of keys) {
      expect(client.getQueryState(key)?.isInvalidated).toBe(true)
    }
  }

  function seed(client: QueryClient) {
    client.setQueryData(['tarifarios'], {})
    client.setQueryData(['tarifarios_calendario'], {})
    client.setQueryData(['tarifario', 't1'], {})
  }

  it('cria tarifário e invalida lista e calendário', async () => {
    server.use(http.post(BASE, () => HttpResponse.json({ id: 't1' })))
    const { result, client } = setup(() => useCreateTarifarioMutation())
    seed(client)

    result.current.mutate({ nome: 'x' } as never)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expectInvalidated(client, [['tarifarios'], ['tarifarios_calendario']])
  })

  it('atualiza tarifário e invalida lista, detalhe e calendário', async () => {
    server.use(http.patch(`${BASE}/t1`, () => HttpResponse.json({ id: 't1' })))
    const { result, client } = setup(() => useUpdateTarifarioMutation('t1'))
    seed(client)

    result.current.mutate({ nome: 'y' } as never)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expectInvalidated(client, [
      ['tarifarios'],
      ['tarifario', 't1'],
      ['tarifarios_calendario'],
    ])
  })

  it('ativa tarifário e invalida caches relacionados', async () => {
    server.use(
      http.patch(`${BASE}/t1/ativar`, () => HttpResponse.json({ id: 't1' }))
    )
    const { result, client } = setup(() => useActivateTarifarioMutation())
    seed(client)

    result.current.mutate('t1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expectInvalidated(client, [
      ['tarifarios'],
      ['tarifario', 't1'],
      ['tarifarios_calendario'],
    ])
  })

  it('desativa tarifário e invalida caches relacionados', async () => {
    server.use(
      http.patch(`${BASE}/t1/desativar`, () => HttpResponse.json({ id: 't1' }))
    )
    const { result, client } = setup(() => useDeactivateTarifarioMutation())
    seed(client)

    result.current.mutate('t1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expectInvalidated(client, [
      ['tarifarios'],
      ['tarifario', 't1'],
      ['tarifarios_calendario'],
    ])
  })

  it('não invalida caches quando a criação falha', async () => {
    server.use(http.post(BASE, () => HttpResponse.json({}, { status: 422 })))
    const { result, client } = setup(() => useCreateTarifarioMutation())
    seed(client)

    result.current.mutate({} as never)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryState(['tarifarios'])?.isInvalidated).toBe(false)
  })
})
