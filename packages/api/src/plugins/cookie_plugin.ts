import { fastifyCookie } from '@fastify/cookie'
import { COOKIE_SECRET } from '@/config/env'
import type { FastifyTypedInstance } from '@/types/fastify'

export function setCookie(app: FastifyTypedInstance) {
  app.register(fastifyCookie, {
    secret: COOKIE_SECRET,
  })
}
