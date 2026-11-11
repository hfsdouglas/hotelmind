import { expect, type Page } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('admin@hotelmind.com.br')
  await page.getByLabel('Senha').fill('senha1234')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}
