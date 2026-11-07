import { z } from 'zod'

const HEX_COLOR = z
  .string()
  .regex(
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    'Código HEX inválido (#RGB ou #RRGGBB)'
  )

export const hotelTemaFormSchema = z.object({
  logo_principal: z.string().nullable().default(null),
  logo_escuro: z.string().nullable().default(null),
  favicon: z.string().nullable().default(null),
  cor_primaria: HEX_COLOR.default('#1e40af'),
  cor_secundaria: HEX_COLOR.default('#64748b'),
  cor_fundo: HEX_COLOR.default('#ffffff'),
  cor_superficie: HEX_COLOR.default('#f8fafc'),
  cor_texto_principal: HEX_COLOR.default('#0f172a'),
  cor_texto_secundario: HEX_COLOR.default('#475569'),
  cor_destaque: HEX_COLOR.default('#f59e0b'),
})

export const hotelConfiguracaoFormSchema = z
  .object({
    // Seção 1: Dados Cadastrais & Contato
    nome_hotel: z.string().min(1, 'Nome corporativo é obrigatório'),
    nome_fantasia: z.string().min(1, 'Nome de exibição/fantasia é obrigatório'),
    razao_social: z.string().min(1, 'Razão social é obrigatória'),
    cnpj: z.string().min(14, 'CNPJ é obrigatório'),
    email_comercial: z.string().email('E-mail comercial inválido'),
    telefone_comercial: z.string().min(10, 'Telefone comercial é obrigatório'),
    celular: z.string().nullable().default(null),
    website: z.string().nullable().default(null),
    categoria: z.enum(['HOTEL', 'POUSADA', 'RESORT', 'HOSTEL', 'FLAT']),
    classificacao_estrelas: z.number().int().min(0).max(5).default(0),

    // Seção 2: Apresentação & Slogan
    descricao_curta: z
      .string()
      .max(160, 'Máximo de 160 caracteres')
      .nullable()
      .default(null),
    descricao_completa: z.string().nullable().default(null),

    // Seção 3: Identidade Visual & Tema
    tema: hotelTemaFormSchema,

    // Seção 4: Políticas de Crianças & Hóspedes
    limite_idade_crianca_gratis: z
      .number()
      .int()
      .min(0, 'Não pode ser negativo')
      .default(5),
    quantidade_max_criancas_gratis: z
      .number()
      .int()
      .min(0, 'Não pode ser negativo')
      .default(1),

    // Seção 5: Horários Operacionais
    horario_checkin: z
      .string()
      .min(1, 'Horário de check-in é obrigatório')
      .default('14:00'),
    horario_checkout: z
      .string()
      .min(1, 'Horário de check-out é obrigatório')
      .default('12:00'),
    recepcao_24h: z.boolean().default(true),
    horario_abertura_recepcao: z.string().nullable().default(null),
    horario_fechamento_recepcao: z.string().nullable().default(null),

    // Seção 6: Regras da Casa & Pets
    aceita_pets: z.boolean().default(false),
    peso_maximo_pet_kg: z.number().nullable().default(null),
    permite_fumar: z.boolean().default(false),
    taxa_higienizacao_fumo: z.number().nullable().default(null),

    // Seção 7: Estacionamento & Conectividade
    tipo_estacionamento: z
      .enum(['GRATUITO', 'PAGO_LOCAL', 'CONVENIADO', 'NAO_POSSUI'])
      .default('NAO_POSSUI'),
    valor_diaria_estacionamento: z.number().nullable().default(null),
    estacionamento_reserva_previa: z.boolean().default(false),
    cobertura_estacionamento: z
      .enum(['COBERTO', 'DESCOBERTO', 'MISTO'])
      .default('DESCOBERTO'),

    possui_wifi: z.boolean().default(true),
    tipo_wifi: z
      .enum(['GRATUITO_TOTAL', 'GRATUITO_AREAS_COMUNS', 'PAGO'])
      .default('GRATUITO_TOTAL'),
    nome_rede_wifi: z.string().nullable().default(null),
    senha_rede_wifi: z.string().nullable().default(null),
    exibir_wifi_voucher: z.boolean().default(true),
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
        'Horários de abertura e fechamento são obrigatórios quando a recepção não funciona 24h',
      path: ['horario_abertura_recepcao'],
    }
  )

export type HotelConfiguracaoFormData = z.infer<
  typeof hotelConfiguracaoFormSchema
>
