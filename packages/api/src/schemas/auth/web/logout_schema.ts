import { z } from 'zod'

export const logout_response_schema = z.object({
  message: z.string(),
})
