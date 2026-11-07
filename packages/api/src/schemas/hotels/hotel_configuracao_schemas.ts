import { z } from 'zod'

const HEX_COLOR = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Formato de cor HEX inválido')

export const error_response_schema = z.object({
  message: z.string(),
})

export const hotel_tema_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  logo_principal: z.string().nullable(),
  logo_escuro: z.string().nullable(),
  favicon: z.string().nullable(),
  cor_primaria: HEX_COLOR,
  cor_secundaria: HEX_COLOR,
  cor_fundo: HEX_COLOR,
  cor_superficie: HEX_COLOR,
  cor_texto_principal: HEX_COLOR,
  cor_texto_secundario: HEX_COLOR,
  cor_destaque: HEX_COLOR,
})

export const update_hotel_tema_input_schema = z.object({
  logo_principal: z.string().nullable().optional(),
  logo_escuro: z.string().nullable().optional(),
  favicon: z.string().nullable().optional(),
  cor_primaria: HEX_COLOR.default('#1e40af'),
  cor_secundaria: HEX_COLOR.default('#64748b'),
  cor_fundo: HEX_COLOR.default('#ffffff'),
  cor_superficie: HEX_COLOR.default('#f8fafc'),
  cor_texto_principal: HEX_COLOR.default('#0f172a'),
  cor_texto_secundario: HEX_COLOR.default('#475569'),
  cor_destaque: HEX_COLOR.default('#f59e0b'),
})

export const hotel_configuracao_response_schema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),

  // Dados Cadastrais & Contato
  nome_hotel: z.string(),
  nome_fantasia: z.string(),
  razao_social: z.string(),
  cnpj: z.string(),
  email_comercial: z.string(),
  telefone_comercial: z.string(),
  celular: z.string().nullable(),
  website: z.string().nullable(),
  categoria: z.enum(['HOTEL', 'POUSADA', 'RESORT', 'HOSTEL', 'FLAT']),
  classificacao_estrelas: z.number().int().min(0).max(5),

  // Apresentação & Slogan
  descricao_curta: z.string().nullable(),
  descricao_completa: z.string().nullable(),

  // Políticas de Crianças & Hóspedes
  limite_idade_crianca_gratis: z.number().int().min(0),
  quantidade_max_criancas_gratis: z.number().int().min(0),

  // Horários Operacionais
  horario_checkin: z.string(),
  horario_checkout: z.string(),
  recepcao_24h: z.boolean(),
  horario_abertura_recepcao: z.string().nullable(),
  horario_fechamento_recepcao: z.string().nullable(),

  // Regras da Casa & Pets
  aceita_pets: z.boolean(),
  peso_maximo_pet_kg: z.number().nullable(),
  permite_fumar: z.boolean(),
  taxa_higienizacao_fumo: z.number().nullable(),

  // Estacionamento & Conectividade
  tipo_estacionamento: z.enum([
    'GRATUITO',
    'PAGO_LOCAL',
    'CONVENIADO',
    'NAO_POSSUI',
  ]),
  valor_diaria_estacionamento: z.number().nullable(),
  estacionamento_reserva_previa: z.boolean(),
  cobertura_estacionamento: z.enum(['COBERTO', 'DESCOBERTO', 'MISTO']),
  possui_wifi: z.boolean(),
  tipo_wifi: z.enum(['GRATUITO_TOTAL', 'GRATUITO_AREAS_COMUNS', 'PAGO']),
  nome_rede_wifi: z.string().nullable(),
  senha_rede_wifi: z.string().nullable(),
  exibir_wifi_voucher: z.boolean(),

  // Identidade Visual & Tema
  tema: hotel_tema_schema.nullable(),
})

export const update_hotel_configuracao_body_schema = z
  .object({
    nome_hotel: z.string().min(1, 'Nome corporativo é obrigatório'),
    nome_fantasia: z.string().min(1, 'Nome fantasia é obrigatório'),
    razao_social: z.string().min(1, 'Razão social é obrigatória'),
    cnpj: z.string().min(14, 'CNPJ é obrigatório'),
    email_comercial: z.string().email('E-mail comercial inválido'),
    telefone_comercial: z.string().min(10, 'Telefone comercial é obrigatório'),
    celular: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    categoria: z
      .enum(['HOTEL', 'POUSADA', 'RESORT', 'HOSTEL', 'FLAT'])
      .default('HOTEL'),
    classificacao_estrelas: z.number().int().min(0).max(5).default(0),

    descricao_curta: z
      .string()
      .max(160, 'Descrição curta deve ter no máximo 160 caracteres')
      .nullable()
      .optional(),
    descricao_completa: z.string().nullable().optional(),

    limite_idade_crianca_gratis: z.number().int().min(0).default(5),
    quantidade_max_criancas_gratis: z.number().int().min(0).default(1),

    horario_checkin: z.string().default('14:00'),
    horario_checkout: z.string().default('12:00'),
    recepcao_24h: z.boolean().default(true),
    horario_abertura_recepcao: z.string().nullable().optional(),
    horario_fechamento_recepcao: z.string().nullable().optional(),

    aceita_pets: z.boolean().default(false),
    peso_maximo_pet_kg: z.number().nullable().optional(),
    permite_fumar: z.boolean().default(false),
    taxa_higienizacao_fumo: z.number().nullable().optional(),

    tipo_estacionamento: z
      .enum(['GRATUITO', 'PAGO_LOCAL', 'CONVENIADO', 'NAO_POSSUI'])
      .default('NAO_POSSUI'),
    valor_diaria_estacionamento: z.number().nullable().optional(),
    estacionamento_reserva_previa: z.boolean().default(false),
    cobertura_estacionamento: z
      .enum(['COBERTO', 'DESCOBERTO', 'MISTO'])
      .default('DESCOBERTO'),
    possui_wifi: z.boolean().default(true),
    tipo_wifi: z
      .enum(['GRATUITO_TOTAL', 'GRATUITO_AREAS_COMUNS', 'PAGO'])
      .default('GRATUITO_TOTAL'),
    nome_rede_wifi: z.string().nullable().optional(),
    senha_rede_wifi: z.string().nullable().optional(),
    exibir_wifi_voucher: z.boolean().default(true),

    tema: update_hotel_tema_input_schema,
  })
  .refine(
    data => {
      if (!data.recepcao_24h) {
        return (
          !!data.horario_abertura_recepcao && !!data.horario_fechamento_recepcao
        )
      }
      return true
    },
    {
      message:
        'Horários de abertura e fechamento são obrigatórios quando a recepção não for 24 horas',
      path: ['horario_abertura_recepcao'],
    }
  )
