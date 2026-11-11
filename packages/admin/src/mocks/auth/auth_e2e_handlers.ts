import { HttpResponse, http } from 'msw'

const BASE_URL = 'http://localhost:3000'

/**
 * Stateful session for the browser (E2E) only. The unit-test handlers answer
 * `/auth/me` as always authenticated; in E2E that would skip the login page.
 * `browser.ts` flips this flag from the mocked login/logout responses.
 */
const KEY = 'e2e:authenticated'

function is_authenticated() {
  return sessionStorage.getItem(KEY) === 'true'
}

export function set_e2e_authenticated(value: boolean) {
  sessionStorage.setItem(KEY, String(value))
}

export const auth_e2e_handlers = [
  http.get(`${BASE_URL}/admin/auth/me`, () => {
    if (!is_authenticated()) {
      return HttpResponse.json({ message: 'Não autenticado' }, { status: 401 })
    }
    // fall through to the default handler in auth_handlers.ts
    return undefined
  }),
]
