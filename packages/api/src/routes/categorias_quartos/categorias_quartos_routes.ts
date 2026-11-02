import { z } from 'zod'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/lib/prisma'
import { PostgresCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/implementation/postgres_categoria_quarto_repository'
import { CriarCategoriaQuartoUseCase } from '@/core/usecases/categorias_quartos/criar_categoria_quarto_use_case'
import { ListarCategoriasQuartoUseCase } from '@/core/usecases/categorias_quartos/listar_categorias_quarto_use_case'
import { AtualizarCategoriaQuartoUseCase } from '@/core/usecases/categorias_quartos/atualizar_categoria_quarto_use_case'
import { CategoriaQuartoConflictError, CategoriaQuartoNotFoundError } from '@/core/errors/categoria_quarto_errors'
import { categoria_quarto_response_schema, create_categoria_quarto_body_schema, error_response_schema, list_categorias_quartos_query_schema, list_categorias_quartos_response_schema, update_categoria_quarto_body_schema } from '@/schemas/categorias_quartos/categorias_quartos_schema'

export async function categorias_quartos_routes(app: FastifyTypedInstance) {
  const repository = new PostgresCategoriaQuartoRepository(db)
  const create_use_case = new CriarCategoriaQuartoUseCase(repository)
  const list_use_case = new ListarCategoriasQuartoUseCase(repository)
  const update_use_case = new AtualizarCategoriaQuartoUseCase(repository)

  app.get('/categorias_quartos', { onRequest: [app.authenticate], schema: { tags: ['Categorias de quartos'], querystring: list_categorias_quartos_query_schema, response: { 200: list_categorias_quartos_response_schema, 401: error_response_schema } } }, async (request, reply) => {
    return reply.status(200).send(await list_use_case.execute(request.user.hotelId, request.query))
  })

  app.post('/categorias_quartos', { onRequest: [app.authenticate], schema: { tags: ['Categorias de quartos'], body: create_categoria_quarto_body_schema, response: { 201: categoria_quarto_response_schema, 401: error_response_schema, 409: error_response_schema } } }, async (request, reply) => {
    try {
      return reply.status(201).send(await create_use_case.execute({ ...request.body, hotel_id: request.user.hotelId }))
    } catch (error) {
      if (error instanceof CategoriaQuartoConflictError) return reply.status(409).send({ message: error.message })
      throw error
    }
  })

  app.get('/categorias_quartos/:id', { onRequest: [app.authenticate], schema: { tags: ['Categorias de quartos'], params: z.object({ id: z.string() }), response: { 200: categoria_quarto_response_schema, 401: error_response_schema, 404: error_response_schema } } }, async (request, reply) => {
    const category = await repository.find_by_id(request.params.id, request.user.hotelId)
    if (!category) return reply.status(404).send({ message: new CategoriaQuartoNotFoundError().message })
    return reply.status(200).send(category)
  })

  app.put('/categorias_quartos/:id', { onRequest: [app.authenticate], schema: { tags: ['Categorias de quartos'], params: z.object({ id: z.string() }), body: update_categoria_quarto_body_schema, response: { 200: categoria_quarto_response_schema, 401: error_response_schema, 404: error_response_schema, 409: error_response_schema } } }, async (request, reply) => {
    try {
      return reply.status(200).send(await update_use_case.execute({ ...request.body, id: request.params.id, hotel_id: request.user.hotelId }))
    } catch (error) {
      if (error instanceof CategoriaQuartoNotFoundError) return reply.status(404).send({ message: error.message })
      if (error instanceof CategoriaQuartoConflictError) return reply.status(409).send({ message: error.message })
      throw error
    }
  })
}
