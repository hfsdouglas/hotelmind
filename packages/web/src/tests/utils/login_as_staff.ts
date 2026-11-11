import { expect, type Page } from '@playwright/test'

/**
 * Logs in through the real login form (backed by MSW mocks). The session lives
 * in sessionStorage, so it survives subsequent `page.goto` calls.
 */
export async function login_as_staff(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('seu@email.com').fill('test@example.com')
  await page.getByPlaceholder('••••••••').fill('password123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Visão Geral' })).toBeVisible()
}
