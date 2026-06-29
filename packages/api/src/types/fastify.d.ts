import 'fastify'
import '@fastify/jwt'
import type { FastifyRequest, FastifyReply } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>
    authenticateAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void>
  }

  interface FastifyRequest {
    admin?: {
      adminId: string
      nomecompleto: string
      email: string
    }
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      userId: string
      hotelId: string
      nomecompleto: string
      email: string
    }
  }
}
