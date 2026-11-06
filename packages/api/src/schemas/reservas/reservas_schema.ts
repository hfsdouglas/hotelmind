import { z } from 'zod'

export const reserva_params_schema = z.object({
  id: z.string().uuid(),
})

export const reserva_hospede_params_schema = z.object({
  id: z.string().uuid(),
  posicao: z.coerce.number().int().min(1),
})

export const token_publico_params_schema = z.object({
  token: z.string().min(1),
})

export const token_publico_hospede_params_schema = z.object({
  token: z.string().min(1),
  posicao: z.coerce.number().int().min(1),
})

export const list_reservas_query_schema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(250).default(25),
  busca: z.string().trim().min(1).optional(),
  status: z
    .enum([
      'a_confirmar',
      'confirmada',
      'check_in',
      'check_out',
      'no_show',
      'cancelada',
    ])
    .optional(),
  quarto_id: z.string().uuid().optional(),
  regime_alimentacao_id: z.string().uuid().optional(),
  parceiro_comercial_id: z.string().uuid().optional(),
  check_in_de: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  check_in_ate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

export const consultar_disponibilidade_query_schema = z.object({
  check_in: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de check-in deve ser YYYY-MM-DD.'),
  check_out: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de check-out deve ser YYYY-MM-DD.'),
  regime_alimentacao_id: z.string().uuid('Regime de alimentação inválido.'),
  pessoas: z.coerce.number().int().min(1, 'Informe pelo menos 1 pessoa.'),
})

export const create_reserva_body_schema = z.object({
  titular_nome: z
    .string()
    .trim()
    .min(2, 'O nome do titular deve ter pelo menos 2 caracteres.')
    .max(150),
  titular_telefone: z.string().trim().max(30).nullable().optional(),
  titular_email: z
    .string()
    .trim()
    .email('E-mail do titular inválido.')
    .max(150)
    .nullable()
    .optional()
    .or(z.literal('')),
  quarto_id: z.string().uuid('Selecione uma suíte válida.'),
  regime_alimentacao_id: z
    .string()
    .uuid('Selecione um regime de alimentação válido.'),
  parceiro_comercial_id: z.string().uuid().nullable().optional(),
  check_in: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in deve ser YYYY-MM-DD.'),
  check_out: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out deve ser YYYY-MM-DD.'),
  quantidade_adultos: z.coerce
    .number()
    .int()
    .min(1, 'Informe pelo menos 1 adulto.'),
  quantidade_criancas: z.coerce.number().int().min(0).default(0),
  quantidade_pets: z.coerce.number().int().min(0).optional(),
  cupom_desconto: z.string().trim().max(50).nullable().optional(),
  observacoes: z.string().trim().max(2000).nullable().optional(),
})

export const update_reserva_body_schema = z.object({
  titular_nome: z.string().trim().min(2).max(150).optional(),
  titular_telefone: z.string().trim().max(30).nullable().optional(),
  titular_email: z
    .string()
    .trim()
    .email('E-mail do titular inválido.')
    .max(150)
    .nullable()
    .optional()
    .or(z.literal('')),
  quarto_id: z.string().uuid().optional(),
  regime_alimentacao_id: z.string().uuid().optional(),
  parceiro_comercial_id: z.string().uuid().nullable().optional(),
  check_in: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  check_out: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  quantidade_adultos: z.coerce.number().int().min(1).optional(),
  quantidade_criancas: z.coerce.number().int().min(0).optional(),
  quantidade_pets: z.coerce.number().int().min(0).optional(),
  cupom_desconto: z.string().trim().max(50).nullable().optional(),
  status: z
    .enum([
      'a_confirmar',
      'confirmada',
      'check_in',
      'check_out',
      'no_show',
      'cancelada',
    ])
    .optional(),
  observacoes: z.string().trim().max(2000).nullable().optional(),
})

export const change_reserva_status_body_schema = z.object({
  status: z.enum([
    'a_confirmar',
    'confirmada',
    'check_in',
    'check_out',
    'no_show',
    'cancelada',
  ]),
})

export const save_ficha_body_schema = z.object({
  concluir: z.boolean().optional(),
  nome_completo: z.string().trim().max(150).nullable().optional(),
  nacionalidade: z.string().trim().max(60).nullable().optional(),
  data_nascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  sexo: z.string().trim().max(15).nullable().optional(),
  profissao: z.string().trim().max(80).nullable().optional(),
  tipo_documento: z
    .enum(['cpf', 'rg', 'passaporte', 'outro'])
    .nullable()
    .optional(),
  numero_documento: z.string().trim().max(30).nullable().optional(),
  logradouro: z.string().trim().max(120).nullable().optional(),
  numero_endereco: z.string().trim().max(20).nullable().optional(),
  complemento: z.string().trim().max(50).nullable().optional(),
  bairro: z.string().trim().max(60).nullable().optional(),
  cidade: z.string().trim().max(60).nullable().optional(),
  estado: z.string().trim().max(2).nullable().optional(),
  cep: z.string().trim().max(10).nullable().optional(),
  pais_residencia: z.string().trim().max(60).nullable().optional(),
  telefone: z.string().trim().max(30).nullable().optional(),
  email: z
    .string()
    .trim()
    .email()
    .max(150)
    .nullable()
    .optional()
    .or(z.literal('')),
  motivo_viagem: z.string().trim().max(30).nullable().optional(),
  meio_transporte: z.string().trim().max(30).nullable().optional(),
  procedencia: z.string().trim().max(100).nullable().optional(),
  proximo_destino: z.string().trim().max(100).nullable().optional(),
  responsavel_posicao: z.coerce.number().int().min(1).nullable().optional(),
})

export const hospede_response_schema = z.object({
  id: z.string(),
  posicao: z.number(),
  ficha_status: z.enum(['pendente', 'rascunho', 'preenchida']),
  preenchido_por: z.enum(['cliente', 'hotel']).nullable(),
  preenchido_em: z.string().nullable(),
  nome_completo: z.string().nullable(),
  nacionalidade: z.string().nullable(),
  data_nascimento: z.string().nullable(),
  sexo: z.string().nullable(),
  profissao: z.string().nullable(),
  tipo_documento: z.enum(['cpf', 'rg', 'passaporte', 'outro']).nullable(),
  numero_documento: z.string().nullable(),
  logradouro: z.string().nullable(),
  numero_endereco: z.string().nullable(),
  complemento: z.string().nullable(),
  bairro: z.string().nullable(),
  cidade: z.string().nullable(),
  estado: z.string().nullable(),
  cep: z.string().nullable(),
  pais_residencia: z.string().nullable(),
  telefone: z.string().nullable(),
  email: z.string().nullable(),
  motivo_viagem: z.string().nullable(),
  meio_transporte: z.string().nullable(),
  procedencia: z.string().nullable(),
  proximo_destino: z.string().nullable(),
  responsavel_posicao: z.number().nullable(),
})

export const reserva_response_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  codigo: z.string(),
  titular_nome: z.string(),
  titular_telefone: z.string().nullable(),
  titular_email: z.string().nullable(),
  quarto_id: z.string(),
  regime_alimentacao_id: z.string(),
  parceiro_comercial_id: z.string().nullable(),
  check_in: z.string(),
  check_out: z.string(),
  quantidade_adultos: z.number(),
  quantidade_criancas: z.number(),
  valor_total: z.string(),
  detalhamento_diarias: z.array(
    z.object({
      data: z.string(),
      tarifario_id: z.string(),
      tarifario_nome: z.string(),
      valor_diaria: z.string(),
    })
  ),
  status: z.enum([
    'a_confirmar',
    'confirmada',
    'check_in',
    'check_out',
    'no_show',
    'cancelada',
  ]),
  token_fnrh: z.string(),
  token_fnrh_ativo: z.boolean(),
  fnrh_enviada_em: z.string().nullable(),
  fichas_preenchidas: z.number(),
  total_hospedes: z.number(),
  observacoes: z.string().nullable(),
  quarto: z
    .object({
      id: z.string(),
      identificacao: z.string(),
      categoria_nome: z.string(),
    })
    .optional(),
  regime_alimentacao: z
    .object({
      id: z.string(),
      titulo: z.string(),
      cor_pulseira: z.string(),
    })
    .optional(),
  parceiro_comercial: z
    .object({
      id: z.string(),
      razao_social: z.string(),
    })
    .nullable()
    .optional(),
  hospedes: z.array(hospede_response_schema).optional(),
  criado_em: z.string(),
  atualizado_em: z.string(),
})

export const reserva_list_response_schema = z.object({
  data: z.array(reserva_response_schema),
  meta: z.object({
    total: z.number(),
    pagina: z.number(),
    limite: z.number(),
    ultima_pagina: z.number(),
    total_paginas: z.number().optional(),
  }),
})

export const quarto_disponivel_schema = z.object({
  quarto_id: z.string(),
  identificacao: z.string(),
  categoria_id: z.string().optional(),
  categoria_nome: z.string(),
  limite_hospedes: z.number(),
  valor_total: z.string(),
})

export const conflito_error_response_schema = z.object({
  message: z.string(),
  alternativas: z.array(quarto_disponivel_schema),
})

export const fnrh_publica_view_schema = z.object({
  hotel_nome: z.string(),
  titular_nome: z.string(),
  check_in: z.string(),
  check_out: z.string(),
  quarto_identificacao: z.string(),
  total_hospedes: z.number(),
  fnrh_enviada_em: z.string().nullable(),
  hospedes: z.array(hospede_response_schema),
})

export const error_response_schema = z.object({
  message: z.string(),
})
