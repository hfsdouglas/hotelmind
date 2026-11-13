import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { make_categoria_quarto } from '@/mocks/categorias_quartos/categorias_quartos_handlers'
import { QUARTO_101_ID } from '@/mocks/quartos/quartos_handlers'
import { REGIME_PENSAO_COMPLETA_ID } from '@/mocks/regimes_alimentacao/regimes_alimentacao_handlers'
import { server } from '@/mocks/server'
import { make_tarifario } from '@/mocks/tarifarios/tarifarios_handlers'
import { useNovaReservaOpcoes } from './use_nova_reserva_opcoes'

const BASE_URL = 'http://localhost:3000'
const PARCEIRO_ID = '00000000-0000-4000-8000-0000000000b1'

const CRITERIOS_COMPLETOS = {
  checkIn: '2026-12-01',
  checkOut: '2026-12-04',
  regimeId: REGIME_PENSAO_COMPLETA_ID,
  totalPessoas: 2,
  parceiroId: '',
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useNovaReservaOpcoes', () => {
  it('returns the active regimes and partners', async () => {
    server.use(
      http.get(`${BASE_URL}/comercial/parceiros`, () =>
        HttpResponse.json({
          data: [{ id: PARCEIRO_ID, razao_social: 'Agência CVC Turismo' }],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        })
      )
    )

    const { result } = renderHook(
      () => useNovaReservaOpcoes({ ...CRITERIOS_COMPLETOS, checkIn: '' }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.regimes).toHaveLength(2)
      expect(result.current.parceiros).toHaveLength(1)
    })
    expect(result.current.regimes.map(r => r.titulo)).toEqual([
      'Pensão Completa',
      'Meia Pensão',
    ])
  })

  it.each([
    ['sem check-in', { checkIn: '' }],
    ['sem check-out', { checkOut: '' }],
    ['com check-out igual ao check-in', { checkOut: '2026-12-01' }],
    ['com check-out anterior ao check-in', { checkOut: '2026-11-30' }],
    ['sem regime', { regimeId: '' }],
    ['sem pessoas', { totalPessoas: 0 }],
  ])('does not query availability %s', async (_label, override) => {
    let chamadas = 0
    server.use(
      http.get(`${BASE_URL}/reservas/disponibilidade`, () => {
        chamadas += 1
        return HttpResponse.json([])
      })
    )

    const { result } = renderHook(
      () => useNovaReservaOpcoes({ ...CRITERIOS_COMPLETOS, ...override }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.regimes).toHaveLength(2))

    expect(result.current.podeConsultar).toBe(false)
    expect(result.current.disponiveis).toEqual([])
    expect(chamadas).toBe(0)
  })

  it('queries availability with the full criteria and returns the available suites', async () => {
    let params: URLSearchParams | undefined
    server.use(
      http.get(`${BASE_URL}/reservas/disponibilidade`, ({ request }) => {
        params = new URL(request.url).searchParams
        return HttpResponse.json([
          {
            quarto_id: QUARTO_101_ID,
            identificacao: '101',
            categoria_id: 'categoria-1',
            categoria_nome: 'Suíte Luxo',
            limite_hospedes: 2,
            valor_total: '900.00',
          },
        ])
      })
    )

    const { result } = renderHook(
      () =>
        useNovaReservaOpcoes({
          ...CRITERIOS_COMPLETOS,
          parceiroId: PARCEIRO_ID,
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.disponiveis).toHaveLength(1))

    expect(result.current.podeConsultar).toBe(true)
    expect(result.current.disponiveis[0].quarto_id).toBe(QUARTO_101_ID)
    expect(params?.get('check_in')).toBe('2026-12-01')
    expect(params?.get('check_out')).toBe('2026-12-04')
    expect(params?.get('regime_alimentacao_id')).toBe(REGIME_PENSAO_COMPLETA_ID)
    expect(params?.get('pessoas')).toBe('2')
    expect(params?.get('parceiro_id')).toBe(PARCEIRO_ID)
  })

  it('omits parceiro_id when booking direct', async () => {
    let params: URLSearchParams | undefined
    server.use(
      http.get(`${BASE_URL}/reservas/disponibilidade`, ({ request }) => {
        params = new URL(request.url).searchParams
        return HttpResponse.json([])
      })
    )

    const { result } = renderHook(
      () => useNovaReservaOpcoes(CRITERIOS_COMPLETOS),
      { wrapper }
    )

    await waitFor(() => expect(params).toBeDefined())
    await waitFor(() =>
      expect(result.current.carregandoDisponibilidade).toBe(false)
    )

    expect(params?.has('parceiro_id')).toBe(false)
  })
})

describe('useNovaReservaOpcoes - regimes for the preferred suite', () => {
  afterEach(() => {
    server.events.removeAllListeners()
  })

  function track_requests() {
    const tarifarios: URL[] = []
    const todas: URL[] = []
    server.events.on('request:start', ({ request }) => {
      const url = new URL(request.url)
      todas.push(url)
      if (url.pathname === '/tarifarios') tarifarios.push(url)
    })
    return { tarifarios, todas }
  }

  it('returns only the regimes sold for the preferred suite category', async () => {
    const { tarifarios } = track_requests()

    const { result } = renderHook(
      () =>
        useNovaReservaOpcoes({
          ...CRITERIOS_COMPLETOS,
          quartoPreferidoId: QUARTO_101_ID,
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.regimes).toHaveLength(1))
    expect(result.current.regimes[0].id).toBe(REGIME_PENSAO_COMPLETA_ID)
    const params = tarifarios[0].searchParams
    expect(params.get('categoria_quarto_id')).toBe(make_categoria_quarto().id)
    expect(params.get('ativo')).toBe('true')
    expect(params.get('limite')).toBe('250')
  })

  it('lists each regime once even with several tarifarios for it', async () => {
    server.use(
      http.get(`${BASE_URL}/tarifarios`, () =>
        HttpResponse.json({
          data: [make_tarifario({ id: 't1' }), make_tarifario({ id: 't2' })],
          meta: { pagina: 1, limite: 250, total: 2, ultima_pagina: 1 },
        })
      )
    )

    const { result } = renderHook(
      () =>
        useNovaReservaOpcoes({
          ...CRITERIOS_COMPLETOS,
          quartoPreferidoId: QUARTO_101_ID,
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.carregandoRegimes).toBe(false))
    expect(result.current.regimes.map(r => r.id)).toEqual([
      REGIME_PENSAO_COMPLETA_ID,
    ])
  })

  it('returns no regime when the suite category has no tarifario', async () => {
    server.use(
      http.get(`${BASE_URL}/tarifarios`, () =>
        HttpResponse.json({
          data: [],
          meta: { pagina: 1, limite: 250, total: 0, ultima_pagina: 1 },
        })
      )
    )

    const { result } = renderHook(
      () =>
        useNovaReservaOpcoes({
          ...CRITERIOS_COMPLETOS,
          quartoPreferidoId: QUARTO_101_ID,
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.carregandoRegimes).toBe(false))
    expect(result.current.regimes).toEqual([])
  })

  it('does not expose the full regime list while the suite lookup is loading', async () => {
    server.use(
      http.get(`${BASE_URL}/tarifarios`, async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
        return HttpResponse.json({
          data: [make_tarifario()],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        })
      })
    )

    const { result } = renderHook(
      () =>
        useNovaReservaOpcoes({
          ...CRITERIOS_COMPLETOS,
          quartoPreferidoId: QUARTO_101_ID,
        }),
      { wrapper }
    )
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(result.current.regimes).toEqual([])
    expect(result.current.carregandoRegimes).toBe(true)
    await waitFor(() => expect(result.current.regimes).toHaveLength(1))
  })

  it('returns every active regime and never queries tarifarios without a preferred suite', async () => {
    const { tarifarios, todas } = track_requests()

    const { result } = renderHook(
      () => useNovaReservaOpcoes({ ...CRITERIOS_COMPLETOS, checkIn: '' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.regimes).toHaveLength(2))
    expect(result.current.carregandoRegimes).toBe(false)
    expect(tarifarios).toHaveLength(0)
    expect(todas.some(u => u.searchParams.has('hotel_id'))).toBe(false)
  })

  it('never sends hotel_id when resolving the suite regimes (tenant scope)', async () => {
    const { todas } = track_requests()

    const { result } = renderHook(
      () =>
        useNovaReservaOpcoes({
          ...CRITERIOS_COMPLETOS,
          quartoPreferidoId: QUARTO_101_ID,
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.regimes).toHaveLength(1))
    expect(todas.some(u => u.searchParams.has('hotel_id'))).toBe(false)
  })
})

describe('useNovaReservaOpcoes - loading and error states of the regimes', () => {
  const ERRO = () => HttpResponse.json({ message: 'Falha' }, { status: 500 })

  function delayed(path: string, body: unknown, ms = 200) {
    return http.get(`${BASE_URL}${path}`, async () => {
      await new Promise(resolve => setTimeout(resolve, ms))
      return HttpResponse.json(body)
    })
  }

  function render_opcoes(quartoPreferidoId?: string) {
    return renderHook(
      () => useNovaReservaOpcoes({ ...CRITERIOS_COMPLETOS, quartoPreferidoId }),
      { wrapper }
    )
  }

  it.each([
    ['without a preferred suite', undefined],
    ['with a preferred suite', QUARTO_101_ID],
  ])('reports loading and exposes no regime while the regimes query loads %s', async (_label, quarto) => {
    server.use(
      delayed('/regimes_alimentacao', {
        data: [],
        meta: { pagina: 1, limite: 250, total: 0, ultima_pagina: 1 },
      })
    )
    const { result } = render_opcoes(quarto)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(result.current.carregandoRegimes).toBe(true)
    expect(result.current.regimes).toEqual([])
    expect(result.current.erroRegimes).toBe(false)
    await waitFor(() => expect(result.current.carregandoRegimes).toBe(false))
  })

  it('returns all regimes after a delayed regimes query when there is no preferred suite', async () => {
    const lista = {
      data: [
        {
          id: REGIME_PENSAO_COMPLETA_ID,
          titulo: 'Pensão Completa',
          cor_pulseira: '#10B981',
          ativo: true,
        },
        {
          id: 'regime-2',
          titulo: 'Meia Pensão',
          cor_pulseira: '#F59E0B',
          ativo: true,
        },
      ],
      meta: { pagina: 1, limite: 250, total: 2, ultima_pagina: 1 },
    }
    server.use(delayed('/regimes_alimentacao', lista, 150))
    const { result } = render_opcoes()
    await new Promise(resolve => setTimeout(resolve, 40))
    expect(result.current.carregandoRegimes).toBe(true)

    await waitFor(() => expect(result.current.regimes).toHaveLength(2))
    expect(result.current.carregandoRegimes).toBe(false)
  })

  it('never exposes the full list while the quartos lookup is loading', async () => {
    server.use(
      delayed('/quartos', {
        data: [
          {
            id: QUARTO_101_ID,
            categoria_id: make_categoria_quarto().id,
            identificacao: '101',
          },
        ],
        meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
      })
    )
    const { result } = render_opcoes(QUARTO_101_ID)
    await waitFor(() => expect(result.current.carregandoRegimes).toBe(true))
    await new Promise(resolve => setTimeout(resolve, 60))

    expect(result.current.carregandoRegimes).toBe(true)
    expect(result.current.regimes).toEqual([])
    await waitFor(() => expect(result.current.regimes).toHaveLength(1))
    expect(result.current.carregandoRegimes).toBe(false)
  })

  it('keeps regimes empty whenever it is loading (regimes loaded, tarifarios pending)', async () => {
    server.use(
      delayed('/tarifarios', {
        data: [make_tarifario()],
        meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
      })
    )
    const { result } = render_opcoes(QUARTO_101_ID)
    const violacoes: number[] = []
    const inicio = Date.now()
    while (Date.now() - inicio < 300) {
      if (
        result.current.carregandoRegimes &&
        result.current.regimes.length > 0
      ) {
        violacoes.push(Date.now() - inicio)
      }
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    expect(violacoes).toEqual([])
    expect(result.current.regimes).toHaveLength(1)
  })

  it('fails closed with erroRegimes when the quartos lookup errors', async () => {
    server.use(http.get(`${BASE_URL}/quartos`, ERRO))
    const { result } = render_opcoes(QUARTO_101_ID)

    await waitFor(() => expect(result.current.erroRegimes).toBe(true))
    expect(result.current.regimes).toEqual([])
    expect(result.current.carregandoRegimes).toBe(false)
  })

  it('fails closed with erroRegimes when the tarifarios lookup errors', async () => {
    server.use(http.get(`${BASE_URL}/tarifarios`, ERRO))
    const { result } = render_opcoes(QUARTO_101_ID)

    await waitFor(() => expect(result.current.erroRegimes).toBe(true))
    expect(result.current.regimes).toEqual([])
    expect(result.current.carregandoRegimes).toBe(false)
  })

  it.each([
    ['without a preferred suite', undefined],
    ['with a preferred suite', QUARTO_101_ID],
  ])('reports erroRegimes instead of loading forever when the regimes query errors %s', async (_label, quarto) => {
    server.use(http.get(`${BASE_URL}/regimes_alimentacao`, ERRO))
    const { result } = render_opcoes(quarto)

    await waitFor(() => expect(result.current.erroRegimes).toBe(true))
    expect(result.current.regimes).toEqual([])
    expect(result.current.carregandoRegimes).toBe(false)
  })

  it('keeps the all-active-regimes fallback when the suite is missing from a successful quartos response', async () => {
    server.use(
      http.get(`${BASE_URL}/quartos`, () =>
        HttpResponse.json({
          data: [],
          meta: { pagina: 1, limite: 250, total: 0, ultima_pagina: 1 },
        })
      )
    )
    const { result } = render_opcoes(QUARTO_101_ID)

    await waitFor(() => expect(result.current.regimes).toHaveLength(2))
    expect(result.current.erroRegimes).toBe(false)
    expect(result.current.carregandoRegimes).toBe(false)
  })

  it('reports no error on the happy path', async () => {
    const { result } = render_opcoes(QUARTO_101_ID)

    await waitFor(() => expect(result.current.regimes).toHaveLength(1))
    expect(result.current.erroRegimes).toBe(false)
  })
})
