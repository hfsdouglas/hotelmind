import { z } from 'zod'

export const create_group_body_schema = z.object({
  grupo: z.string().min(1).max(100),
  descricao: z.string().nullable().optional(),
  status: z.enum(['S', 'N']).optional().default('S'),
})

export const create_group_response_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  grupo: z.string(),
  descricao: z.string().nullable(),
  status: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
})

export type CreateGroupBodyInput = z.infer<typeof create_group_body_schema>
