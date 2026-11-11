import { expect, test } from '@playwright/test'
import { login_as_staff } from '../utils/login_as_staff'

test.describe('Quartos (web)', () => {
  test.beforeEach(async ({ page }) => {
    await login_as_staff(page)
  })

  test('lista os quartos com categoria e camas', async ({ page }) => {
    await page.goto('/quartos')

    await expect(page.getByRole('heading', { name: 'Quartos' })).toBeVisible()
    const linha = page.getByRole('row', { name: /101/ })
    await expect(linha).toContainText('Suíte Luxo')
    await expect(linha).toContainText('1x Casal')
    await expect(page.getByRole('row', { name: /102/ })).toBeVisible()
  })

  test('cria um quarto numa categoria existente', async ({ page }) => {
    await page.goto('/quartos')
    await page.getByRole('link', { name: 'Novo quarto' }).click()

    await page.getByLabel('Categoria *').click()
    await page.getByRole('option', { name: 'Suíte Luxo' }).click()
    await page.getByLabel('Identificação *').fill('201')
    await page.getByLabel('Limite de hóspedes *').fill('4')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Quarto criado com sucesso.')).toBeVisible()
    await expect(page).toHaveURL(/\/quartos$/)
    await expect(page.getByRole('row', { name: /201/ })).toBeVisible()
  })

  test('mostra erros de validação ao salvar sem preencher', async ({
    page,
  }) => {
    await page.goto('/quartos/novo')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page).toHaveURL(/\/quartos\/novo$/)
    await expect(page.locator('p.text-destructive').first()).toBeVisible()
  })

  test('avisa quando a identificação do quarto já existe', async ({ page }) => {
    await page.goto('/quartos/novo')

    await page.getByLabel('Categoria *').click()
    await page.getByRole('option', { name: 'Suíte Luxo' }).click()
    await page.getByLabel('Identificação *').fill('101')
    await page.getByLabel('Limite de hóspedes *').fill('2')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(
      page.getByText('Já existe um quarto com esta identificação.')
    ).toBeVisible()
  })
})
