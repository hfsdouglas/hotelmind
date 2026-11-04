import { z } from 'zod'

export const tipo_parceiro_enum = z.enum([
  'agente_autonomo',
  'agencia_viagens',
  'operadora_turismo',
  'clube_turismo',
  'empresa_corporativa',
])

export const tipo_pessoa_enum = z.enum(['PF', 'PJ'])

export const modelo_tarifario_enum = z.enum(['net', 'comissionada', 'acordo'])

export const politica_faturamento_enum = z.enum([
  'voucher',
  'faturado',
  'prepago',
])

export const status_parceiro_enum = z.enum(['ativo', 'inativo', 'bloqueado'])

export const tipo_contato_enum = z.enum([
  'comercial',
  'financeiro',
  'operacional',
])

export const parceiro_params_schema = z.object({
  id: z.string().uuid(),
})

export const parceiro_contato_schema = z.object({
  id: z.string().optional(),
  tipo_contato: tipo_contato_enum,
  nome: z.string().trim().min(1, 'Nome do contato é obrigatório.').max(100),
  email: z.string().trim().email('E-mail do contato inválido.').max(150),
  telefone: z
    .string()
    .trim()
    .min(1, 'Telefone do contato é obrigatório.')
    .max(30),
  cargo: z.string().trim().max(50).nullable().optional(),
})

export const list_parceiros_query_schema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(250).default(25),
  busca: z.string().trim().min(1).optional(),
  tipo_parceiro: tipo_parceiro_enum.optional(),
  status: status_parceiro_enum.optional(),
  cidade: z.string().trim().min(1).optional(),
  estado: z.string().trim().length(2).optional(),
})

export const create_parceiro_body_schema = z.object({
  tipo_parceiro: tipo_parceiro_enum,
  tipo_pessoa: tipo_pessoa_enum,
  razao_social: z
    .string()
    .trim()
    .min(1, 'Razão Social ou Nome Completo é obrigatório.')
    .max(150),
  nome_fantasia: z.string().trim().max(150).nullable().optional(),
  documento: z.string().trim().max(20).nullable().optional(),
  inscricao_estadual: z.string().trim().max(30).nullable().optional(),
  estrangeiro: z.boolean().default(false),
  cadastur: z.string().trim().max(30).nullable().optional(),
  codigo_iata: z.string().trim().max(20).nullable().optional(),
  registro_embratur: z.string().trim().max(30).nullable().optional(),

  // Endereço
  logradouro: z.string().trim().max(120).nullable().optional(),
  numero: z.string().trim().max(20).nullable().optional(),
  complemento: z.string().trim().max(50).nullable().optional(),
  bairro: z.string().trim().max(60).nullable().optional(),
  cidade: z.string().trim().max(60).nullable().optional(),
  estado: z.string().trim().max(2).nullable().optional(),
  cep: z.string().trim().max(10).nullable().optional(),
  pais: z.string().trim().max(50).default('Brasil'),

  // Regras Comerciais
  modelo_tarifario: modelo_tarifario_enum.default('comissionada'),
  comissao_padrao: z.coerce.number().min(0).max(100).default(0),
  politica_faturamento: politica_faturamento_enum.default('prepago'),
  prazo_pagamento_dias: z.coerce.number().int().min(0).default(0),
  limite_credito: z.coerce.number().min(0).default(0),
  allotment_quartos: z.coerce.number().int().min(0).default(0),

  observacoes: z.string().trim().max(2000).nullable().optional(),
  contatos: z.array(parceiro_contato_schema).optional(),
})

export const update_parceiro_body_schema = z.object({
  tipo_parceiro: tipo_parceiro_enum.optional(),
  tipo_pessoa: tipo_pessoa_enum.optional(),
  razao_social: z.string().trim().min(1).max(150).optional(),
  nome_fantasia: z.string().trim().max(150).nullable().optional(),
  documento: z.string().trim().max(20).nullable().optional(),
  inscricao_estadual: z.string().trim().max(30).nullable().optional(),
  estrangeiro: z.boolean().optional(),
  cadastur: z.string().trim().max(30).nullable().optional(),
  codigo_iata: z.string().trim().max(20).nullable().optional(),
  registro_embratur: z.string().trim().max(30).nullable().optional(),

  // Endereço
  logradouro: z.string().trim().max(120).nullable().optional(),
  numero: z.string().trim().max(20).nullable().optional(),
  complemento: z.string().trim().max(50).nullable().optional(),
  bairro: z.string().trim().max(60).nullable().optional(),
  cidade: z.string().trim().max(60).nullable().optional(),
  estado: z.string().trim().max(2).nullable().optional(),
  cep: z.string().trim().max(10).nullable().optional(),
  pais: z.string().trim().max(50).optional(),

  // Regras Comerciais
  modelo_tarifario: modelo_tarifario_enum.optional(),
  comissao_padrao: z.coerce.number().min(0).max(100).optional(),
  politica_faturamento: politica_faturamento_enum.optional(),
  prazo_pagamento_dias: z.coerce.number().int().min(0).optional(),
  limite_credito: z.coerce.number().min(0).optional(),
  allotment_quartos: z.coerce.number().int().min(0).optional(),

  observacoes: z.string().trim().max(2000).nullable().optional(),
  contatos: z.array(parceiro_contato_schema).optional(),
})

export const update_status_parceiro_body_schema = z.object({
  status: status_parceiro_enum,
  motivo_bloqueio: z.string().trim().max(500).nullable().optional(),
})

export const parceiro_response_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  tipo_parceiro: z.string(),
  tipo_pessoa: z.string(),
  razao_social: z.string(),
  nome_fantasia: z.string().nullable().optional(),
  documento: z.string().nullable().optional(),
  inscricao_estadual: z.string().nullable().optional(),
  estrangeiro: z.boolean(),
  cadastur: z.string().nullable().optional(),
  codigo_iata: z.string().nullable().optional(),
  registro_embratur: z.string().nullable().optional(),

  logradouro: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  pais: z.string(),

  modelo_tarifario: z.string(),
  comissao_padrao: z.string(),
  politica_faturamento: z.string(),
  prazo_pagamento_dias: z.number(),
  limite_credito: z.string(),
  allotment_quartos: z.number(),

  status: z.string(),
  motivo_bloqueio: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  criado_em: z.string(),
  atualizado_em: z.string(),

  contatos: z.array(parceiro_contato_schema).optional(),
})

export const list_parceiros_response_schema = z.object({
  data: z.array(parceiro_response_schema),
  meta: z.object({
    total: z.number(),
    pagina: z.number(),
    limite: z.number(),
    ultima_pagina: z.number(),
  }),
})

export const error_response_schema = z.object({
  message: z.string(),
})
