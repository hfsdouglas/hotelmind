import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { LoginForm } from './LoginForm'
import { AuthProvider } from '@/contexts/AuthContext'

function renderLoginForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster />
          <LoginForm />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('LoginForm', () => {
  it('renders email and password inputs and a submit button', () => {
    renderLoginForm()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('shows a Zod validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('Email inválido')).toBeInTheDocument()
  })

  it('shows a Zod validation error when password is too short', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Senha'), 'short')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(
      await screen.findByText('Senha deve ter pelo menos 8 caracteres'),
    ).toBeInTheDocument()
  })

  it('shows a loading state while the request is in flight', async () => {
    const user = userEvent.setup()
    // Override with a handler that never resolves so isPending stays true
    server.use(
      http.post('http://localhost:3000/auth/login', async () => {
        await new Promise(() => {}) // never resolves
        return HttpResponse.json({})
      }),
    )
    renderLoginForm()

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
    })
  })

  it('shows a success toast on valid credentials', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(
      await screen.findByText('Login realizado com sucesso'),
    ).toBeInTheDocument()
  })

  it('shows an error toast on invalid credentials', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText('Email'), 'wrong@example.com')
    await user.type(screen.getByLabelText('Senha'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(
      await screen.findByText('Email ou senha inválidos'),
    ).toBeInTheDocument()
  })
})
