import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../utils/login_as_admin'

test.describe('Administradores (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('lista os administradores cadastrados', async ({ page }) => {
    await page.goto('/administradores')

    await expect(
      page.getByRole('heading', { name: 'Administradores' })
    ).toBeVisible()
    await expect(page.getByRole('cell', { name: 'João Silva' })).toBeVisible()
    await expect(
      page.getByRole('cell', { name: 'maria@hotelmind.com' })
    ).toBeVisible()
  })

  test('cria um administrador e volta para a listagem', async ({ page }) => {
    await page.goto('/administradores')
    await page.getByRole('link', { name: 'Novo admin' }).click()
    await expect(page).toHaveURL(/\/administradores\/novo/)

    await page.getByLabel('Nome completo').fill('Carla Dias')
    await page.getByLabel('E-mail').fill('carla@hotelmind.com')
    await page.getByLabel('Senha').fill('senha12345')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Administrador criado.')).toBeVisible()
    await expect(page).toHaveURL(/\/administradores$/)
  })

  test('mostra erros de validação ao salvar administrador inválido', async ({
    page,
  }) => {
    await page.goto('/administradores/novo')

    await page.getByLabel('E-mail').fill('x@y.com')
    await page.getByLabel('Senha').fill('123')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(
      page.getByText('Senha deve ter pelo menos 8 caracteres')
    ).toBeVisible()
    await expect(
      page.getByText('Nome deve ter pelo menos 2 caracteres')
    ).toBeVisible()
    await expect(page).toHaveURL(/\/administradores\/novo/)
  })
})
