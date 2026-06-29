import { z } from 'zod'
import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const AdminPayloadSchema = z.object({
  sub: z.string(),
  role: z.literal('admin'),
  admin: z.object({
    nomecompleto: z.string(),
    email: z.string(),
  }),
})

async function adminAuthPlugin(app: FastifyInstance) {
  app.decorate(
    'authenticateAdmin',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { admin_token } = request.cookies

      if (!admin_token) {
        return reply.status(401).send({ message: 'Token não fornecido!' })
      }

      try {
        const raw = app.jwt.verify(admin_token)
        const decoded = AdminPayloadSchema.parse(raw)

        request.admin = {
          adminId: decoded.sub,
          nomecompleto: decoded.admin.nomecompleto,
          email: decoded.admin.email,
        }
      } catch {
        return reply.status(401).send({ message: 'Token inválido!' })
      }
    },
  )
}

export default fp(adminAuthPlugin)
