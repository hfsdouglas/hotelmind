import { FastifyTypedInstance } from '@/types/fastify'
import auth_routes from '@/routes/auth/auth_routes'

export function setRoutes(app: FastifyTypedInstance) {
  app.register(auth_routes)
}
