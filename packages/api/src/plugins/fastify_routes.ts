import { admin_administrators_routes } from '@/routes/admin/admin_administrators_routes'
import { admin_auth_routes } from '@/routes/auth/admin/auth_routes'
import { auth_routes } from '@/routes/auth/web/auth_routes'
import { categorias_quartos_routes } from '@/routes/categorias_quartos/categorias_quartos_routes'
import { parceiros_comerciais_routes } from '@/routes/comercial/parceiros_routes'
import { groups_routes } from '@/routes/groups/groups_routes'
import { admin_hotels_routes } from '@/routes/hotels/admin/hotels_routes'
import { leads_routes } from '@/routes/leads/leads_routes'
import { orcamentos_routes } from '@/routes/orcamentos/orcamentos_routes'
import { quartos_routes } from '@/routes/quartos/quartos_routes'
import { regimes_alimentacao_routes } from '@/routes/regimes_alimentacao/regimes_alimentacao_routes'
import { admin_routes_routes } from '@/routes/routes/admin/routes_routes'
import { routes_routes } from '@/routes/routes/web/routes_routes'
import { admin_suporte_routes } from '@/routes/suporte/admin/suporte_routes'
import { tarifarios_routes } from '@/routes/tarifarios/tarifarios_routes'
import { users_routes } from '@/routes/users/users_routes'
import type { FastifyTypedInstance } from '@/types/fastify'

export function setRoutes(app: FastifyTypedInstance) {
  app.register(auth_routes)
  app.register(admin_auth_routes)
  app.register(groups_routes)
  app.register(users_routes)
  app.register(routes_routes)
  app.register(admin_hotels_routes)
  app.register(admin_routes_routes)
  app.register(admin_administrators_routes)
  app.register(admin_suporte_routes)
  app.register(categorias_quartos_routes)
  app.register(quartos_routes)
  app.register(tarifarios_routes)
  app.register(regimes_alimentacao_routes)
  app.register(leads_routes)
  app.register(orcamentos_routes)
  app.register(parceiros_comerciais_routes)
}
