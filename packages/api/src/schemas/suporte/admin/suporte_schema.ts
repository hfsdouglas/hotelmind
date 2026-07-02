import { z } from 'zod'

export const suporte_acesso_query_schema = z.object({
  usuario_id: z.string(),
})

export const error_schema = z.object({ message: z.string() })
