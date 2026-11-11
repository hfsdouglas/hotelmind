import { expect, test } from '@playwright/test'

test.describe('Login (web)', () => {
  test('autentica com credenciais válidas e abre o dashboard', async ({
    page,
  }) => {
    await page.goto('/login')

    await page.getByPlaceholder('seu@email.com').fill('test@example.com')
    await page.getByPlaceholder('••••••••').fill('password123')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('mantém na tela de login com credenciais inválidas', async ({
    page,
  }) => {
    await page.goto('/login')

    await page.getByPlaceholder('seu@email.com').fill('errado@example.com')
    await page.getByPlaceholder('••••••••').fill('senha-incorreta')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/login/)
  })
})
