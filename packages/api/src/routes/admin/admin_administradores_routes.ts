import { z } from 'zod'
import bcrypt from 'bcryptjs'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/db/client'
import { PostgresAdministratorRepository } from '@/db/repositories/administrators/implementation/postgres_administrator_repository'
import {
  admin_administrador_body_schema,
  admin_administrador_update_schema,
  admin_administradores_list_schema,
  admin_administrador_response_schema,
  admin_error_schema,
} from '@/schemas/admin/admin_administradores_schema'

const pagination_query = z.object({
  pagina: z.coerce.number().min(1).default(1),
  limite: z.coerce.number().min(1).max(250).default(50),
  busca: z.string().optional(),
  ordenar_por: z.string().optional(),
  direcao: z.enum(['asc', 'desc']).default('asc'),
})

export async function admin_administradores_routes(app: FastifyTypedInstance) {
  const repo = new PostgresAdministratorRepository(db)

  app.get(
    '/admin/administradores',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Administradores'],
        summary: 'Listar administradores',
        querystring: pagination_query,
        response: { 200: admin_administradores_list_schema },
      },
    },
    async (request, reply) => {
      const result = await repo.list(request.query)
      return reply.status(200).send(result)
    },
  )

  app.post(
    '/admin/administradores',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Administradores'],
        summary: 'Criar administrador',
        body: admin_administrador_body_schema,
        response: { 201: admin_administrador_response_schema, 409: admin_error_schema },
      },
    },
    async (request, reply) => {
      try {
        const { senha, ...rest } = request.body
        const hashed = await bcrypt.hash(senha, 10)
        const admin = await repo.create({ ...rest, senha: hashed })
        return reply.status(201).send({ id: admin.id, nome_completo: admin.nome_completo, email: admin.email, status: admin.status })
      } catch {
        return reply.status(409).send({ message: 'E-mail já cadastrado.' })
      }
    },
  )

  app.get(
    '/admin/administradores/:id',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Administradores'],
        summary: 'Buscar administrador por ID',
        params: z.object({ id: z.string() }),
        response: { 200: admin_administrador_response_schema, 404: admin_error_schema },
      },
    },
    async (request, reply) => {
      const admin = await repo.findById(request.params.id)
      if (!admin) return reply.status(404).send({ message: 'Administrador não encontrado.' })
      return reply.status(200).send({ id: admin.id, nome_completo: admin.nome_completo, email: admin.email, status: admin.status })
    },
  )

  app.put(
    '/admin/administradores/:id',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Administradores'],
        summary: 'Atualizar administrador',
        params: z.object({ id: z.string() }),
        body: admin_administrador_update_schema,
        response: { 200: admin_administrador_response_schema, 404: admin_error_schema },
      },
    },
    async (request, reply) => {
      const admin = await repo.findById(request.params.id)
      if (!admin) return reply.status(404).send({ message: 'Administrador não encontrado.' })

      const { senha, ...rest } = request.body
      const data: Record<string, unknown> = { ...rest }
      if (senha) data.senha = await bcrypt.hash(senha, 10)

      const updated = await repo.update(request.params.id, data)
      return reply.status(200).send({ id: updated.id, nome_completo: updated.nome_completo, email: updated.email, status: updated.status })
    },
  )

  app.delete(
    '/admin/administradores/:id',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Administradores'],
        summary: 'Deletar administrador',
        params: z.object({ id: z.string() }),
        response: { 204: z.null(), 404: admin_error_schema },
      },
    },
    async (request, reply) => {
      const admin = await repo.findById(request.params.id)
      if (!admin) return reply.status(404).send({ message: 'Administrador não encontrado.' })
      await repo.delete(request.params.id)
      return reply.status(204).send(null)
    },
  )
}
