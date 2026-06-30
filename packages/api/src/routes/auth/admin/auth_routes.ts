import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/lib/prisma'
import { PostgresAdministratorRepository } from '@/core/repositories/administrators/implementation/postgres_administrator_repository'
import { BcryptPasswordHasher } from '@/lib/bcrypt_password_hasher'
import { AdminLoginUseCase } from '@/core/usecases/auth/admin_login_use_case'
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '@/core/errors/authentication_error'
import {
  login_body_schema,
  login_response_schema,
  me_response_schema,
  error_schema,
  logout_response_schema,
} from '@/schemas/auth/admin/auth_schema'

export async function admin_auth_routes(app: FastifyTypedInstance) {
  const adminRepo = new PostgresAdministratorRepository(db)
  const login_use_case = new AdminLoginUseCase(adminRepo, new BcryptPasswordHasher())

  app.post(
    '/admin/auth/login',
    {
      schema: {
        tags: ['Admin - Auth'],
        summary: 'Autenticar administrador',
        body: login_body_schema,
        response: { 200: login_response_schema, 401: error_schema, 500: error_schema },
      },
    },
    async (request, reply) => {
      try {
        const admin = await login_use_case.execute(request.body)

        const token = app.jwt.sign(
          { sub: admin.id, role: 'admin', admin: { nomecompleto: admin.nome_completo, email: admin.email } },
          { expiresIn: '7d' },
        )

        reply.setCookie('admin_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })

        return reply.status(200).send({
          admin: { id: admin.id, nome_completo: admin.nome_completo, email: admin.email },
          message: `Seja bem-vindo, ${admin.first_name}!`,
        })
      } catch (error) {
        if (error instanceof UserNotFoundError || error instanceof InvalidCredentialsError) {
          return reply.status(401).send({ message: 'Credenciais inválidas' })
        }
        return reply.status(500).send({ message: 'Erro interno do servidor' })
      }
    },
  )

  app.get(
    '/admin/auth/me',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Auth'],
        summary: 'Retorna sessão ativa do administrador',
        response: { 200: me_response_schema, 401: error_schema },
      },
    },
    async (request, reply) => {
      const { adminId, nomecompleto, email } = request.admin!
      return reply.status(200).send({ admin: { id: adminId, nome_completo: nomecompleto, email } })
    },
  )

  app.post(
    '/admin/auth/logout',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Auth'],
        summary: 'Encerrar sessão do administrador',
        response: { 200: logout_response_schema, 401: error_schema },
      },
    },
    async (_request, reply) => {
      reply.clearCookie('admin_token', { path: '/' })
      return reply.status(200).send({ message: 'Logout realizado com sucesso.' })
    },
  )
}
