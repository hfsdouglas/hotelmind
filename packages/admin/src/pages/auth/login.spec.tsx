import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { render_with_providers } from '@/test/render_with_providers'
import { LoginPage } from './login'

// Silence sonner toast in tests
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('LoginPage', () => {
  it('renders the heading and form fields', () => {
    render_with_providers(<LoginPage />)
    expect(screen.getByRole('heading', { name: /hotelmind admin/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('shows validation errors when submitted with empty fields', async () => {
    const user = userEvent.setup()
    render_with_providers(<LoginPage />)
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when password is too short', async () => {
    const user = userEvent.setup()
    render_with_providers(<LoginPage />)
    await user.type(screen.getByLabelText(/e-mail/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/senha/i), 'short')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText(/pelo menos 8 caracteres/i)).toBeInTheDocument()
    })
  })

  it('disables the submit button while the request is in-flight', async () => {
    const user = userEvent.setup()
    // slow down the handler so we can observe the pending state
    server.use(
      http.post('http://localhost:3000/admin/auth/login', async () => {
        await new Promise(res => setTimeout(res, 100))
        return HttpResponse.json({
          admin: { id: '1', nome_completo: 'Admin', email: 'admin@hotelmind.com.br' },
          message: 'ok',
        })
      }),
    )
    render_with_providers(<LoginPage />)
    await user.type(screen.getByLabelText(/e-mail/i), 'admin@hotelmind.com.br')
    await user.type(screen.getByLabelText(/senha/i), 'senha1234')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
  })

  it('calls the login API with the submitted credentials', async () => {
    const user = userEvent.setup()
    let captured_body: unknown

    server.use(
      http.post('http://localhost:3000/admin/auth/login', async ({ request }) => {
        captured_body = await request.json()
        return HttpResponse.json({
          admin: { id: '1', nome_completo: 'Admin', email: 'admin@hotelmind.com.br' },
          message: 'Login realizado com sucesso.',
        })
      }),
    )

    render_with_providers(<LoginPage />)
    await user.type(screen.getByLabelText(/e-mail/i), 'admin@hotelmind.com.br')
    await user.type(screen.getByLabelText(/senha/i), 'senha1234')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(captured_body).toEqual({
        email: 'admin@hotelmind.com.br',
        password: 'senha1234',
      })
    })
  })
})
