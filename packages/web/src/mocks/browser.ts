import { setupWorker } from 'msw/browser'
import {
  auth_e2e_handlers,
  set_e2e_authenticated,
} from './auth/auth_e2e_handlers'
import { handlers } from './handlers'

export const worker = setupWorker(...auth_e2e_handlers, ...handlers)

worker.events.on('response:mocked', ({ request, response }) => {
  const { pathname } = new URL(request.url)
  if (pathname.endsWith('/auth/login')) {
    set_e2e_authenticated(response.status === 200)
  }
  if (pathname.endsWith('/auth/logout')) {
    set_e2e_authenticated(false)
  }
})
