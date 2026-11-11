import { auth_handlers } from './auth/auth_handlers'
import { categorias_quartos_handlers } from './categorias_quartos/categorias_quartos_handlers'
import { fnrh_handlers } from './fnrh/fnrh_handlers'
import { orcamentos_handlers } from './orcamentos/orcamentos_handlers'
import { quartos_handlers } from './quartos/quartos_handlers'
import { reservas_handlers } from './reservas/reservas_handlers'
import { usuarios_handlers } from './usuarios/usuarios_handlers'

export const handlers = [
  ...auth_handlers,
  ...usuarios_handlers,
  ...categorias_quartos_handlers,
  ...quartos_handlers,
  ...reservas_handlers,
  ...orcamentos_handlers,
  ...fnrh_handlers,
]
