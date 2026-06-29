import type { FastifyTypedInstance } from '@/types/fastify'
import { auth_routes } from '@/routes/auth/auth_routes'
import { grupos_routes } from '@/routes/grupos/grupos_routes'
import { usuarios_routes } from '@/routes/usuarios/usuarios_routes'
import { rotas_routes } from '@/routes/rotas/rotas_routes'

export function setRoutes(app: FastifyTypedInstance) {
  app.register(auth_routes)
  app.register(grupos_routes)
  app.register(usuarios_routes)
  app.register(rotas_routes)
}
