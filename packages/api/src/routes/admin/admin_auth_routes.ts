import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/db/client'
import { PostgresAdministratorRepository } from '@/db/repositories/administrators/implementation/postgres_administrator_repository'
import { BcryptPasswordHasher } from '@/lib/bcrypt_password_hasher'
import { AdminLoginUseCase } from '@/core/usecases/admin_login_use_case'
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '@/core/errors/authentication_error'
import {
  admin_login_body_schema,
  admin_login_response_schema,
  admin_me_response_schema,
  admin_error_schema,
  admin_logout_schema,
} from '@/schemas/admin/admin_auth_schema'

export async function admin_auth_routes(app: FastifyTypedInstance) {
  const adminRepo = new PostgresAdministratorRepository(db)
  const login_use_case = new AdminLoginUseCase(adminRepo, new BcryptPasswordHasher())

  app.post(
    '/admin/auth/login',
    {
      schema: {
        tags: ['Admin - Auth'],
        summary: 'Autenticar administrador',
        body: admin_login_body_schema,
        response: { 200: admin_login_response_schema, 401: admin_error_schema, 500: admin_error_schema },
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
        response: { 200: admin_me_response_schema, 401: admin_error_schema },
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
        response: { 200: admin_logout_schema, 401: admin_error_schema },
      },
    },
    async (_request, reply) => {
      reply.clearCookie('admin_token', { path: '/' })
      return reply.status(200).send({ message: 'Logout realizado com sucesso.' })
    },
  )
}
