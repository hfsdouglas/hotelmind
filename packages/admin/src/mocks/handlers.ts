import { administradores_handlers } from './administradores/administradores_handlers'
import { auth_handlers } from './auth/auth_handlers'
import { hoteis_handlers } from './hoteis/hoteis_handlers'
import { rotas_handlers } from './rotas/rotas_handlers'

export const handlers = [
  ...auth_handlers,
  ...hoteis_handlers,
  ...rotas_handlers,
  ...administradores_handlers,
]
