import { auth_handlers } from './auth_handlers'
import { hoteis_handlers } from './hoteis_handlers'
import { rotas_handlers } from './rotas_handlers'
import { administradores_handlers } from './administradores_handlers'

export const handlers = [
  ...auth_handlers,
  ...hoteis_handlers,
  ...rotas_handlers,
  ...administradores_handlers,
]
