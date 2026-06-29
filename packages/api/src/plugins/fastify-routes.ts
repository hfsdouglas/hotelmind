import type { FastifyTypedInstance } from '@/types/fastify'
import { auth_routes } from '@/routes/auth/auth_routes'
import { grupos_routes } from '@/routes/grupos/grupos_routes'
import { usuarios_routes } from '@/routes/usuarios/usuarios_routes'
import { rotas_routes } from '@/routes/rotas/rotas_routes'
import { admin_auth_routes } from '@/routes/admin/admin_auth_routes'
import { admin_hoteis_routes } from '@/routes/admin/admin_hoteis_routes'
import { admin_rotas_routes } from '@/routes/admin/admin_rotas_routes'
import { admin_administradores_routes } from '@/routes/admin/admin_administradores_routes'

export function setRoutes(app: FastifyTypedInstance) {
  app.register(auth_routes)
  app.register(grupos_routes)
  app.register(usuarios_routes)
  app.register(rotas_routes)
  app.register(admin_auth_routes)
  app.register(admin_hoteis_routes)
  app.register(admin_rotas_routes)
  app.register(admin_administradores_routes)
}
