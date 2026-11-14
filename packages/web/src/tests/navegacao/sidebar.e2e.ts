import { expect, test } from '@playwright/test'
import { login_as_staff } from '../utils/login_as_staff'

test.describe('Menu lateral (web)', () => {
  test('lembra o menu recolhido depois de recarregar a página', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await login_as_staff(page)

    await page.getByRole('button', { name: 'Recolher menu' }).click()
    await expect(
      page.getByRole('button', { name: 'Expandir menu' })
    ).toBeVisible()

    await page.reload()

    await expect(
      page.getByRole('button', { name: 'Expandir menu' })
    ).toBeVisible()
    expect(
      await page.evaluate(() =>
        localStorage.getItem('suitesync-sidebar-collapsed')
      )
    ).toBe('true')
  })

  test('o conteúdo ocupa a tela toda, sem barra superior', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await login_as_staff(page)

    await expect(page.getByRole('banner')).toHaveCount(0)
    await expect(page.locator('main#conteudo-principal')).toBeVisible()
  })

  test('no celular o menu abre como gaveta e fecha ao navegar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await login_as_staff(page)

    await expect(
      page.getByRole('button', { name: 'Recolher menu' })
    ).toBeHidden()
    await page.getByRole('button', { name: 'Abrir menu' }).click()

    const gaveta = page.getByRole('dialog', { name: 'Menu principal' })
    await expect(gaveta).toBeVisible()

    await gaveta
      .getByRole('link', { name: 'SuiteSync — Ir para o dashboard' })
      .click()

    await expect(gaveta).toBeHidden()
  })

  test('Esc fecha a gaveta e devolve o foco ao botão de menu', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await login_as_staff(page)

    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect(
      page.getByRole('dialog', { name: 'Menu principal' })
    ).toBeVisible()
    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused()
  })
})
