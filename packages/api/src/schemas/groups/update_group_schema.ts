import { z } from 'zod'

export const update_group_body_schema = z.object({
  grupo: z.string().min(1).max(100).optional(),
  descricao: z.string().nullable().optional(),
  status: z.enum(['S', 'N']).optional(),
})

export const sync_routes_body_schema = z.object({
  rota_ids: z.array(z.string().uuid()),
})

export type UpdateGroupBodyInput = z.infer<typeof update_group_body_schema>
export type SyncRoutesBodyInput = z.infer<typeof sync_routes_body_schema>
