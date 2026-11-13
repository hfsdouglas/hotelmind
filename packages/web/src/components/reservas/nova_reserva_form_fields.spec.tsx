import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { useNovaReservaForm } from '@/hooks/use_nova_reserva_form'
import { QUARTO_101_ID, QUARTO_102_ID } from '@/mocks/quartos/quartos_handlers'
import {
  REGIME_MEIA_PENSAO_ID,
  REGIME_PENSAO_COMPLETA_ID,
} from '@/mocks/regimes_alimentacao/regimes_alimentacao_handlers'
import { server } from '@/mocks/server'
import { make_tarifario } from '@/mocks/tarifarios/tarifarios_handlers'
import type { QuartoPreferido } from '@/types/calendar_range_selection'
import { NovaReservaFormFields } from './nova_reserva_form_fields'

const BASE_URL = 'http://localhost:3000'
const QUARTO_PREFERIDO_101: QuartoPreferido = {
  id: '00000000-0000-4000-8000-000000000101',
  identificacao: '101',
}

interface HarnessProps {
  quartoPreferido?: QuartoPreferido
  com_datas?: boolean
}

function Harness({ quartoPreferido, com_datas = true }: HarnessProps) {
  const controller = useNovaReservaForm({
    valoresIniciais: com_datas
      ? { check_in: '2026-12-01', check_out: '2026-12-04' }
      : undefined,
    onSuccess: () => {},
  })
  return (
    <NovaReservaFormFields
      controller={controller}
      quartoPreferido={quartoPreferido}
    />
  )
}

function render_fields(props: HarnessProps = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <Harness {...props} />
    </QueryClientProvider>
  )
}

async function choose_regime(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole('button', { name: /Pensão Completa/ })
  )
}

function only_suite_102_available() {
  server.use(
    http.get(`${BASE_URL}/reservas/disponibilidade`, () =>
      HttpResponse.json([
        {
          quarto_id: QUARTO_102_ID,
          identificacao: '102',
          categoria_id: 'categoria-1',
          categoria_nome: 'Suíte Luxo',
          limite_hospedes: 3,
          valor_total: '900.00',
        },
      ])
    )
  )
}

const AVISO_101 =
  'A suíte 101 não está disponível para os critérios informados. Escolha outra suíte.'

describe('NovaReservaFormFields - structure', () => {
  it('renders every section title', () => {
    render_fields()

    for (const title of [
      'Passo 1: Período e Hóspedes',
      'Passo 2: Parceiro Comercial',
      'Passo 3: Regime de Alimentação',
      'Cupom de Desconto',
      'Passo 4: Acomodação (Suítes Disponíveis pelo Tarifário)',
      'Passo 5: Dados do Titular da Reserva',
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
  })

  it('renders the field labels', () => {
    render_fields()

    for (const label of [
      'Data de Check-in *',
      'Data de Check-out *',
      'Adultos *',
      'Crianças',
      'Pets (opcional)',
      'Nome Completo *',
      'Celular / WhatsApp *',
      'E-mail',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
  })

  it('shows the initial dates in the date fields', () => {
    render_fields()

    expect(screen.getByLabelText('Data de Check-in *')).toHaveValue(
      '01/12/2026'
    )
    expect(screen.getByLabelText('Data de Check-out *')).toHaveValue(
      '04/12/2026'
    )
  })

  it('does not render its own form element or action buttons', () => {
    const { container } = render_fields()

    expect(container.querySelector('form')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Salvar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull()
  })
})

describe('NovaReservaFormFields - preferred suite', () => {
  it('selects the preferred suite automatically once it is available', async () => {
    const user = userEvent.setup()
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })

    await choose_regime(user)

    expect(
      await screen.findByText(/Proposta selecionada: Suíte 101/)
    ).toBeInTheDocument()
    expect(screen.queryByText(AVISO_101)).toBeNull()
  })

  it('warns and selects nothing when the preferred suite is not available', async () => {
    only_suite_102_available()
    const user = userEvent.setup()
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })

    await choose_regime(user)

    expect(await screen.findByText(AVISO_101)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(AVISO_101)
    expect(
      screen.getByRole('button', { name: /Suíte 102/ })
    ).toBeInTheDocument()
    expect(screen.queryByText(/Proposta selecionada/)).toBeNull()
  })

  it('never selects a suite that the hotel availability did not return (tenant scope)', async () => {
    only_suite_102_available()
    const user = userEvent.setup()
    render_fields({
      quartoPreferido: {
        id: '00000000-0000-4000-8000-0000000000ff',
        identificacao: '999',
      },
    })

    await choose_regime(user)

    expect(
      await screen.findByText(
        'A suíte 999 não está disponível para os critérios informados. Escolha outra suíte.'
      )
    ).toBeInTheDocument()
    expect(screen.queryByText(/Proposta selecionada/)).toBeNull()
  })

  it('does not override the suite the operator chose after the preferred one', async () => {
    const user = userEvent.setup()
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })
    await choose_regime(user)
    await screen.findByText(/Proposta selecionada: Suíte 101/)

    await user.click(screen.getByRole('button', { name: /Suíte 102/ }))

    await waitFor(() =>
      expect(
        screen.getByText(/Proposta selecionada: Suíte 102/)
      ).toBeInTheDocument()
    )
    expect(screen.queryByText(/Proposta selecionada: Suíte 101/)).toBeNull()
  })

  it('shows no warning and selects no suite without a preferred suite', async () => {
    const user = userEvent.setup()
    render_fields()

    await choose_regime(user)

    expect(
      await screen.findByRole('button', { name: /Suíte 101/ })
    ).toBeInTheDocument()
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.queryByText(/Proposta selecionada/)).toBeNull()
  })

  it('shows no warning before the availability can be queried', () => {
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101, com_datas: false })

    expect(screen.queryByText(AVISO_101)).toBeNull()
  })
})

describe('NovaReservaFormFields - regimes for the preferred suite', () => {
  function tarifarios_responding(data: unknown[], delay_ms = 0) {
    server.use(
      http.get(`${BASE_URL}/tarifarios`, async () => {
        if (delay_ms) await new Promise(r => setTimeout(r, delay_ms))
        return HttpResponse.json({
          data,
          meta: {
            pagina: 1,
            limite: 250,
            total: data.length,
            ultima_pagina: 1,
          },
        })
      })
    )
  }

  it('shows only the regimes available for the suite when opened with period and suite', async () => {
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })

    expect(
      await screen.findByRole('button', { name: /Pensão Completa/ })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Meia Pensão/ })).toBeNull()
  })

  it('does not flash the full regime list while the suite regimes load', async () => {
    tarifarios_responding([make_tarifario()], 200)
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })

    await new Promise(r => setTimeout(r, 80))
    expect(screen.queryByRole('button', { name: /Meia Pensão/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Pensão Completa/ })).toBeNull()

    expect(
      await screen.findByRole('button', { name: /Pensão Completa/ })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Meia Pensão/ })).toBeNull()
  })

  it('shows an explicit empty message instead of all regimes when the suite has none', async () => {
    tarifarios_responding([])
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })

    expect(await screen.findByText(/nenhum regime/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Pensão/ })).toBeNull()
  })
})

describe('NovaReservaFormFields - opened without period and suite', () => {
  it('shows every active regime before any date is typed', async () => {
    render_fields({ com_datas: false })

    expect(
      await screen.findByRole('button', { name: /Pensão Completa/ })
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /Meia Pensão/ })
    ).toBeInTheDocument()
  })

  it('loads the suites only after dates and regime are set', async () => {
    const user = userEvent.setup()
    render_fields({ com_datas: false })

    await screen.findByRole('button', { name: /Meia Pensão/ })
    expect(screen.queryByRole('button', { name: /Suíte 101/ })).toBeNull()

    await user.click(screen.getByRole('button', { name: /Meia Pensão/ }))
    expect(screen.queryByRole('button', { name: /Suíte 101/ })).toBeNull()

    await user.type(screen.getByLabelText('Data de Check-in *'), '01122026')
    await user.type(screen.getByLabelText('Data de Check-out *'), '04122026')

    expect(
      await screen.findByRole('button', { name: /Suíte 101/ })
    ).toBeInTheDocument()
  })

  it('never calls the tarifarios lookup without a preferred suite', async () => {
    let chamadas = 0
    server.use(
      http.get(`${BASE_URL}/tarifarios`, () => {
        chamadas += 1
        return HttpResponse.json({ data: [], meta: {} })
      })
    )
    render_fields({ com_datas: false })

    await screen.findByRole('button', { name: /Meia Pensão/ })
    expect(chamadas).toBe(0)
  })
})

const MENSAGEM_VAZIA = /nenhum regime de alimentação/i
const MENSAGEM_ERRO = /não foi possível carregar os regimes/i
const TEXTO_CARREGANDO = /consultando regimes|carregando regimes/i

function delay_json(path: string, body: unknown, ms: number) {
  server.use(
    http.get(`${BASE_URL}${path}`, async () => {
      await new Promise(r => setTimeout(r, ms))
      return HttpResponse.json(body)
    })
  )
}

function fail_with_500(path: string) {
  server.use(
    http.get(`${BASE_URL}${path}`, () =>
      HttpResponse.json({ message: 'Falha' }, { status: 500 })
    )
  )
}

describe('NovaReservaFormFields - loading and error states of the regimes', () => {
  const LISTA_VAZIA = {
    data: [],
    meta: { pagina: 1, limite: 250, total: 0, ultima_pagina: 1 },
  }

  it.each([
    ['without a preferred suite', undefined],
    ['with a preferred suite', QUARTO_PREFERIDO_101],
  ])('shows a loading text and never the empty message while the regimes load %s', async (_label, quartoPreferido) => {
    delay_json('/regimes_alimentacao', LISTA_VAZIA, 200)
    render_fields({ quartoPreferido, com_datas: false })

    await new Promise(r => setTimeout(r, 80))
    expect(screen.getByText(TEXTO_CARREGANDO)).toBeInTheDocument()
    expect(screen.queryByText(MENSAGEM_VAZIA)).toBeNull()
  })

  it('shows all regimes once a delayed regimes query resolves (no preferred suite)', async () => {
    const regimes = [REGIME_PENSAO_COMPLETA_ID, REGIME_MEIA_PENSAO_ID].map(
      (id, i) => ({
        id,
        titulo: i === 0 ? 'Pensão Completa' : 'Meia Pensão',
        cor_pulseira: '#10B981',
        descricao: null,
        ativo: true,
      })
    )
    delay_json(
      '/regimes_alimentacao',
      {
        data: regimes,
        meta: { pagina: 1, limite: 250, total: 2, ultima_pagina: 1 },
      },
      150
    )
    render_fields({ com_datas: false })

    await new Promise(r => setTimeout(r, 50))
    expect(screen.queryByText(MENSAGEM_VAZIA)).toBeNull()
    expect(
      await screen.findByRole('button', { name: /Pensão Completa/ })
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /Meia Pensão/ })
    ).toBeInTheDocument()
    expect(screen.queryByText(MENSAGEM_VAZIA)).toBeNull()
  })

  it('never exposes the full list while the quartos lookup is loading', async () => {
    delay_json(
      '/quartos',
      {
        data: [
          {
            id: QUARTO_101_ID,
            categoria_id: '00000000-0000-4000-8000-0000000000c1',
            identificacao: '101',
          },
        ],
        meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
      },
      250
    )
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })

    await new Promise(r => setTimeout(r, 100))
    expect(screen.queryByRole('button', { name: /Pensão/ })).toBeNull()
    expect(screen.queryByText(MENSAGEM_VAZIA)).toBeNull()
    expect(screen.getByText(TEXTO_CARREGANDO)).toBeInTheDocument()
  })

  it('never shows the empty message while the tarifarios lookup is loading', async () => {
    delay_json('/tarifarios', LISTA_VAZIA, 200)
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })

    await new Promise(r => setTimeout(r, 80))
    expect(screen.queryByText(MENSAGEM_VAZIA)).toBeNull()
    expect(screen.queryByRole('button', { name: /Pensão/ })).toBeNull()
  })

  it.each([
    ['quartos', '/quartos'],
    ['tarifarios', '/tarifarios'],
  ])('fails closed with an error message when %s errors', async (_label, path) => {
    fail_with_500(path)
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })

    expect(await screen.findByText(MENSAGEM_ERRO)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Pensão/ })).toBeNull()
    expect(screen.queryByText(MENSAGEM_VAZIA)).toBeNull()
    expect(
      screen.queryByText(
        'Nenhum regime de alimentação disponível para esta suíte.'
      )
    ).toBeNull()
  })

  it.each([
    ['without a preferred suite', undefined],
    ['with a preferred suite', QUARTO_PREFERIDO_101],
  ])('shows the error message instead of loading forever when the regimes query errors %s', async (_label, quartoPreferido) => {
    fail_with_500('/regimes_alimentacao')
    render_fields({ quartoPreferido, com_datas: false })

    expect(await screen.findByText(MENSAGEM_ERRO)).toBeInTheDocument()
    expect(screen.queryByText(TEXTO_CARREGANDO)).toBeNull()
    expect(screen.queryByText(MENSAGEM_VAZIA)).toBeNull()
  })
})

function selected_regime_buttons() {
  return screen
    .queryAllByRole('button', { name: /Pensão|Meia/ })
    .filter(b => within(b).queryByText('Selecionado ✓'))
}

function track_availability() {
  const calls: URLSearchParams[] = []
  server.use(
    http.get(`${BASE_URL}/reservas/disponibilidade`, ({ request }) => {
      calls.push(new URL(request.url).searchParams)
      return HttpResponse.json([
        {
          quarto_id: QUARTO_101_ID,
          identificacao: '101',
          categoria_id: 'categoria-1',
          categoria_nome: 'Suíte Luxo',
          limite_hospedes: 2,
          valor_total: '900.00',
        },
        {
          quarto_id: QUARTO_102_ID,
          identificacao: '102',
          categoria_id: 'categoria-1',
          categoria_nome: 'Suíte Luxo',
          limite_hospedes: 3,
          valor_total: '900.00',
        },
      ])
    })
  )
  return calls
}

describe('NovaReservaFormFields - first regime preselected for period and suite', () => {
  it('selects the first regime and ticks the preferred suite without any click', async () => {
    const calls = track_availability()
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })

    expect(
      await screen.findByText(/Proposta selecionada: Suíte 101/)
    ).toBeInTheDocument()
    const botao = screen.getByRole('button', { name: /Pensão Completa/ })
    expect(within(botao).getByText('Selecionado ✓')).toBeInTheDocument()
    expect(calls.length).toBeGreaterThan(0)
    expect(
      calls.every(
        c => c.get('regime_alimentacao_id') === REGIME_PENSAO_COMPLETA_ID
      )
    ).toBe(true)
    expect(calls[0].has('hotel_id')).toBe(false)
  })

  it('preselects nothing and never queries availability without a preferred suite', async () => {
    const calls = track_availability()
    render_fields()

    await screen.findByRole('button', { name: /Meia Pensão/ })
    await new Promise(r => setTimeout(r, 150))

    expect(selected_regime_buttons()).toHaveLength(0)
    expect(screen.queryByText(/Proposta selecionada/)).toBeNull()
    expect(calls).toHaveLength(0)
  })

  it('preselects nothing and never queries availability without a period', async () => {
    const calls = track_availability()
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101, com_datas: false })

    await screen.findByRole('button', { name: /Pensão Completa/ })
    await new Promise(r => setTimeout(r, 150))

    expect(selected_regime_buttons()).toHaveLength(0)
    expect(calls).toHaveLength(0)
  })

  it('preselects nothing when the suite category has no regime', async () => {
    const calls = track_availability()
    server.use(
      http.get(`${BASE_URL}/tarifarios`, () =>
        HttpResponse.json({
          data: [],
          meta: { pagina: 1, limite: 250, total: 0, ultima_pagina: 1 },
        })
      )
    )
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })

    expect(await screen.findByText(/nenhum regime/i)).toBeInTheDocument()
    await new Promise(r => setTimeout(r, 150))

    expect(selected_regime_buttons()).toHaveLength(0)
    expect(calls).toHaveLength(0)
  })

  it('preselects nothing when the regimes lookup fails', async () => {
    const calls = track_availability()
    fail_with_500('/tarifarios')
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })

    await screen.findByText(MENSAGEM_ERRO)
    await new Promise(r => setTimeout(r, 100))

    expect(calls).toHaveLength(0)
  })

  it('keeps the regime the operator picks afterwards and re-ticks the suite', async () => {
    const calls = track_availability()
    server.use(
      http.get(`${BASE_URL}/tarifarios`, () =>
        HttpResponse.json({
          data: [
            make_tarifario({ id: 't1' }),
            make_tarifario({
              id: 't2',
              regime_alimentacao_id: REGIME_MEIA_PENSAO_ID,
              regime_alimentacao: {
                id: REGIME_MEIA_PENSAO_ID,
                titulo: 'Meia Pensão',
                cor_pulseira: '#F59E0B',
              },
            }),
          ],
          meta: { pagina: 1, limite: 250, total: 2, ultima_pagina: 1 },
        })
      )
    )
    const user = userEvent.setup()
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })
    await screen.findByText(/Proposta selecionada: Suíte 101.*Pensão Completa/)

    await user.click(screen.getByRole('button', { name: /Meia Pensão/ }))

    expect(
      await screen.findByText(/Proposta selecionada: Suíte 101.*Meia Pensão/)
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('button', { name: /Meia Pensão/ })).getByText(
        'Selecionado ✓'
      )
    ).toBeInTheDocument()
    expect(selected_regime_buttons()).toHaveLength(1)
    expect(
      calls.some(c => c.get('regime_alimentacao_id') === REGIME_MEIA_PENSAO_ID)
    ).toBe(true)
  })

  it('does not re-pick the first regime after the operator changes the regime', async () => {
    track_availability()
    server.use(
      http.get(`${BASE_URL}/tarifarios`, () =>
        HttpResponse.json({
          data: [
            make_tarifario({ id: 't1' }),
            make_tarifario({
              id: 't2',
              regime_alimentacao_id: REGIME_MEIA_PENSAO_ID,
            }),
          ],
          meta: { pagina: 1, limite: 250, total: 2, ultima_pagina: 1 },
        })
      )
    )
    const user = userEvent.setup()
    render_fields({ quartoPreferido: QUARTO_PREFERIDO_101 })
    await screen.findByText(/Proposta selecionada: Suíte 101.*Pensão Completa/)
    await user.click(screen.getByRole('button', { name: /Meia Pensão/ }))
    await new Promise(r => setTimeout(r, 200))

    const selecionados = selected_regime_buttons()
    expect(selecionados).toHaveLength(1)
    expect(selecionados[0]).toHaveTextContent('Meia Pensão')
  })
})
