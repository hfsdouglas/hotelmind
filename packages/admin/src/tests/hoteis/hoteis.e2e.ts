import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../utils/login_as_admin'

test.describe('Hotéis (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('lista os hotéis cadastrados', async ({ page }) => {
    await page.goto('/hoteis')

    await expect(page.getByRole('heading', { name: 'Hotéis' })).toBeVisible()
    await expect(
      page.getByRole('cell', { name: 'Grand Palace Hotel' })
    ).toBeVisible()
    await expect(
      page.getByRole('cell', { name: 'Hotel Mar Azul' })
    ).toBeVisible()
  })

  test('cria um hotel e volta para a listagem', async ({ page }) => {
    await page.goto('/hoteis')
    await page.getByRole('link', { name: 'Novo hotel' }).click()
    await expect(page).toHaveURL(/\/hoteis\/novo/)

    await page.getByLabel('Nome do Hotel').fill('Hotel Aurora')
    await page.getByLabel('Razão Social').fill('Aurora Ltda')
    await page.getByLabel('Nome Fantasia').fill('Aurora Hotel')
    await page.getByLabel('CNPJ').fill('11222333000144')
    await page.getByLabel('E-mail Comercial').fill('contato@aurora.com')
    await page.getByLabel('Telefone Comercial').fill('11988887777')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Hotel criado com sucesso.')).toBeVisible()
    await expect(page).toHaveURL(/\/hoteis$/)
  })

  test('mostra erros de validação ao salvar hotel vazio', async ({ page }) => {
    await page.goto('/hoteis/novo')

    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('CNPJ deve ter 14 dígitos')).toBeVisible()
    await expect(page.getByText('E-mail comercial inválido')).toBeVisible()
    await expect(page).toHaveURL(/\/hoteis\/novo/)
  })

  test('edita um hotel existente', async ({ page }) => {
    await page.goto('/hoteis')
    const linha = page.getByRole('row', { name: /Grand Palace Hotel/ })
    await linha.getByTitle('Editar').click()

    await expect(page.getByLabel('Nome Fantasia')).toHaveValue(
      'Grand Palace Hotel'
    )
    await page.getByLabel('Nome Fantasia').fill('Grand Palace Renovado')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Hotel atualizado.')).toBeVisible()
    await expect(page).toHaveURL(/\/hoteis$/)
  })
})
