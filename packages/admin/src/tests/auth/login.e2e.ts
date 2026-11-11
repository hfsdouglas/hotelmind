import { expect, test } from '@playwright/test'

test.describe('Login (admin)', () => {
  test('autentica com credenciais válidas e abre o dashboard', async ({
    page,
  }) => {
    await page.goto('/login')

    await page.getByLabel('E-mail').fill('admin@hotelmind.com.br')
    await page.getByLabel('Senha').fill('senha1234')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('mantém na tela de login com credenciais inválidas', async ({
    page,
  }) => {
    await page.goto('/login')

    await page.getByLabel('E-mail').fill('errado@hotelmind.com.br')
    await page.getByLabel('Senha').fill('senha-incorreta')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/login/)
  })
})
