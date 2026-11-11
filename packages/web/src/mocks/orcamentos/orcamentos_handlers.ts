import type { OrcamentoPublicoVisualizacao } from '@hotelmind/contracts'
import { HttpResponse, http } from 'msw'

const BASE_URL = 'http://localhost:3000'

export const TOKEN_ORCAMENTO_VALIDO = 'orcamento-valido'

const orcamento_publico: OrcamentoPublicoVisualizacao = {
  token_publico: TOKEN_ORCAMENTO_VALIDO,
  hotel_nome: 'Hotel Fazenda Paraíso',
  hotel_telefone: '11999998888',
  check_in: '2026-12-20',
  check_out: '2026-12-22',
  total_noites: 2,
  quantidade_adultos: 2,
  quantidade_criancas: 1,
  quantidade_pets: 0,
  regime_alimentacao: { nome: 'Pensão Completa', cor: '#10B981' },
  categoria_quarto: { nome: 'Chalé Família' },
  lead_nome: 'Renata Vasconcellos',
  detalhamento_noites: [
    {
      data: '2026-12-20',
      tarifario_id: 't1',
      tarifario_nome: 'Tarifa Fim de Ano',
      valor_diaria: '500.00',
    },
    {
      data: '2026-12-21',
      tarifario_id: 't1',
      tarifario_nome: 'Tarifa Fim de Ano',
      valor_diaria: '500.00',
    },
  ],
  valor_total: '1000.00',
  status: 'pendente',
  criado_em: '2026-11-04T12:00:00Z',
}

export const orcamentos_handlers = [
  http.get(`${BASE_URL}/orcamentos/publico/:token`, ({ params }) => {
    if (params.token !== TOKEN_ORCAMENTO_VALIDO) {
      return HttpResponse.json({ message: 'Não encontrado' }, { status: 404 })
    }
    return HttpResponse.json(orcamento_publico)
  }),
]
