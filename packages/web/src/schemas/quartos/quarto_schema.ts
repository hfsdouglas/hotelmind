import { TIPOS_CAMA, type TipoCama } from '@hotelmind/contracts'
import { z } from 'zod'

export const camaItemSchema = z.object({
  tipo: z.enum(TIPOS_CAMA as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Selecione um tipo de cama válido.' }),
  }),
  quantidade: z.coerce
    .number({ invalid_type_error: 'Informe uma quantidade válida.' })
    .int('Quantidade deve ser um número inteiro.')
    .min(1, 'Quantidade deve ser pelo menos 1.'),
})

export type CamaItemFormData = {
  tipo: TipoCama | ''
  quantidade: number | ''
}

export const quartoSchema = z
  .object({
    categoria_id: z.string().trim().min(1, 'Selecione uma categoria.'),
    identificacao: z
      .string()
      .trim()
      .min(1, 'Informe a identificação do quarto.')
      .regex(/^\d+$/, 'A identificação deve conter apenas números.'),
    descricao: z.string().optional().default(''),
    limite_hospedes: z.coerce
      .number({ invalid_type_error: 'Informe um limite positivo de hóspedes.' })
      .int('Limite deve ser um número inteiro.')
      .min(1, 'Informe um limite positivo de hóspedes.'),
    status: z.enum(['S', 'N']).default('S'),
    camas: z
      .array(camaItemSchema)
      .min(1, 'Informe pelo menos um tipo de cama.'),
  })
  .refine(
    data => {
      const types = data.camas.map(bed => bed.tipo).filter(Boolean)
      return new Set(types).size === data.camas.length
    },
    {
      message: 'Cada tipo de cama deve aparecer apenas uma vez.',
      path: ['camas'],
    }
  )

export type QuartoFormData = z.infer<typeof quartoSchema>
