import rateLimit from '@fastify/rate-limit'
import type { FastifyTypedInstance } from '@/types/fastify'

export function setRateLimit(app: FastifyTypedInstance) {
  app.register(rateLimit, {
    global: false,
    max: 100,
    timeWindow: '1 minute',
  })
}
