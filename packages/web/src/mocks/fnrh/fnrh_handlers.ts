import type { FnrhPublicaView, Hospede } from '@hotelmind/contracts'
import { HttpResponse, http } from 'msw'

const BASE_URL = 'http://localhost:3000'

export const TOKEN_FNRH_VALIDO = 'fnrh-valido'

function make_hospede(overrides: Partial<Hospede> = {}): Hospede {
  return {
    id: 'hospede-1',
    posicao: 1,
    ficha_status: 'pendente',
    preenchido_por: null,
    preenchido_em: null,
    nome_completo: null,
    nacionalidade: null,
    data_nascimento: null,
    sexo: null,
    profissao: null,
    tipo_documento: null,
    numero_documento: null,
    logradouro: null,
    numero_endereco: null,
    complemento: null,
    bairro: null,
    cidade: null,
    estado: null,
    cep: null,
    pais_residencia: null,
    telefone: null,
    email: null,
    motivo_viagem: null,
    meio_transporte: null,
    responsavel_posicao: null,
    ...overrides,
  }
}

const fnrh_view: FnrhPublicaView = {
  hotel_nome: 'Hotel Fazenda Paraíso',
  titular_nome: 'Renata Vasconcellos',
  check_in: '2026-12-20',
  check_out: '2026-12-22',
  quarto_identificacao: '101',
  total_hospedes: 2,
  fnrh_enviada_em: null,
  hospedes: [
    make_hospede({
      ficha_status: 'preenchida',
      nome_completo: 'Renata Vasconcellos',
    }),
    make_hospede({ id: 'hospede-2', posicao: 2 }),
  ],
}

export const fnrh_handlers = [
  http.get(`${BASE_URL}/reservas/publico/:token`, ({ params }) => {
    if (params.token !== TOKEN_FNRH_VALIDO) {
      return HttpResponse.json({ message: 'Não encontrado' }, { status: 404 })
    }
    return HttpResponse.json(fnrh_view)
  }),
]
