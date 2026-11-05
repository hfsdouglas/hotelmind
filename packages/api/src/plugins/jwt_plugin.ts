import { fastifyJwt } from '@fastify/jwt'
import { JWT_SECRET } from '@/config/env'
import adminAuthPlugin from '@/plugins/admin_auth_plugin'

import authPlugin from '@/plugins/auth_plugin'
import type { FastifyTypedInstance } from '@/types/fastify'

export function setJWT(app: FastifyTypedInstance) {
  app.register(fastifyJwt, {
    secret: JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  })

  app.register(authPlugin)
  app.register(adminAuthPlugin)
}
