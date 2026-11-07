import { z } from 'zod'

const HEX_COLOR = z
  .string()
  .regex(
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    'Código HEX inválido (#RGB ou #RRGGBB)'
  )

export const hotelConfiguracaoFormSchema = z
  .object({
    hotel_name: z.string().min(1, 'Nome do hotel é obrigatório'),
    legal_name: z.string().default(''),
    tax_id: z.string().default(''),
    category: z.enum(['HOTEL', 'POUSADA', 'RESORT', 'HOSTEL', 'FLAT']),
    star_rating: z.number().int().min(0).max(5).default(0),
    short_description: z
      .string()
      .max(160, 'Máximo de 160 caracteres')
      .nullable()
      .default(null),
    full_description: z.string().nullable().default(null),

    logo_primary: z.string().nullable().default(null),
    logo_dark: z.string().nullable().default(null),
    favicon: z.string().nullable().default(null),
    color_primary: HEX_COLOR.default('#1e40af'),
    color_secondary: HEX_COLOR.default('#64748b'),
    color_background: HEX_COLOR.default('#ffffff'),
    color_surface: HEX_COLOR.default('#f8fafc'),
    color_text_primary: HEX_COLOR.default('#0f172a'),
    color_text_secondary: HEX_COLOR.default('#475569'),
    color_accent: HEX_COLOR.default('#f59e0b'),

    free_child_age_limit: z
      .number()
      .int()
      .min(0, 'Não pode ser negativo')
      .default(5),
    free_child_max_per_room: z
      .number()
      .int()
      .min(0, 'Não pode ser negativo')
      .default(1),

    checkin_time: z
      .string()
      .min(1, 'Horário de check-in é obrigatório')
      .default('14:00'),
    checkout_time: z
      .string()
      .min(1, 'Horário de check-out é obrigatório')
      .default('12:00'),
    reception_24h: z.boolean().default(true),
    reception_opening_time: z.string().nullable().default(null),
    reception_closing_time: z.string().nullable().default(null),

    pet_friendly: z.boolean().default(false),
    pet_max_weight_kg: z.number().nullable().default(null),
    smoking_allowed: z.boolean().default(false),
    smoking_sanitization_fee: z.number().nullable().default(null),

    parking_type: z
      .enum(['GRATUITO', 'PAGO_LOCAL', 'CONVENIADO', 'NAO_POSSUI'])
      .default('NAO_POSSUI'),
    parking_fee_per_day: z.number().nullable().default(null),
    parking_reservation_required: z.boolean().default(false),
    parking_covered: z
      .enum(['COBERTO', 'DESCOBERTO', 'MISTO'])
      .default('DESCOBERTO'),

    wifi_available: z.boolean().default(true),
    wifi_type: z
      .enum(['GRATUITO_TOTAL', 'GRATUITO_AREAS_COMUNS', 'PAGO'])
      .default('GRATUITO_TOTAL'),
    wifi_ssid_default: z.string().nullable().default(null),
    wifi_password_default: z.string().nullable().default(null),
    wifi_show_on_voucher: z.boolean().default(true),
  })
  .refine(
    data => {
      if (!data.reception_24h) {
        return !!data.reception_opening_time && !!data.reception_closing_time
      }
      return true
    },
    {
      message:
        'Horários de abertura e fechamento são obrigatórios quando a recepção não funciona 24h',
      path: ['reception_opening_time'],
    }
  )

export type HotelConfiguracaoFormData = z.infer<
  typeof hotelConfiguracaoFormSchema
>
