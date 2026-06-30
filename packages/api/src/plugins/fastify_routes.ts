import type { FastifyTypedInstance } from '@/types/fastify'
import { auth_routes } from '@/routes/auth/web/auth_routes'
import { admin_auth_routes } from '@/routes/auth/admin/auth_routes'
import { groups_routes } from '@/routes/groups/groups_routes'
import { users_routes } from '@/routes/users/users_routes'
import { routes_routes } from '@/routes/routes/web/routes_routes'
import { admin_hotels_routes } from '@/routes/hotels/admin/hotels_routes'
import { admin_routes_routes } from '@/routes/routes/admin/routes_routes'
import { admin_administrators_routes } from '@/routes/admin/admin_administrators_routes'

export function setRoutes(app: FastifyTypedInstance) {
  app.register(auth_routes)
  app.register(admin_auth_routes)
  app.register(groups_routes)
  app.register(users_routes)
  app.register(routes_routes)
  app.register(admin_hotels_routes)
  app.register(admin_routes_routes)
  app.register(admin_administrators_routes)
}
