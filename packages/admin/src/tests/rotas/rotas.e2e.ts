import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../utils/login_as_admin'

test.describe('Rotas (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('lista as rotas cadastradas', async ({ page }) => {
    await page.goto('/rotas')

    await expect(page.getByRole('heading', { name: 'Rotas' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'hospedagem' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '/caixa' })).toBeVisible()
  })

  test('cria uma rota e volta para a listagem', async ({ page }) => {
    await page.goto('/rotas')
    await page.getByRole('link', { name: 'Nova rota' }).click()
    await expect(page).toHaveURL(/\/rotas\/nova/)

    await page.getByLabel('Módulo').fill('governanca')
    await page.getByLabel('Recurso').fill('limpeza')
    await page.getByLabel('Rota', { exact: true }).fill('/limpeza')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Rota criada.')).toBeVisible()
    await expect(page).toHaveURL(/\/rotas$/)
  })

  test('mostra erros de validação ao salvar rota vazia', async ({ page }) => {
    await page.goto('/rotas/nova')

    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Módulo é obrigatório')).toBeVisible()
    await expect(page.getByText('Recurso é obrigatório')).toBeVisible()
    await expect(page.getByText('Rota é obrigatória')).toBeVisible()
  })
})
