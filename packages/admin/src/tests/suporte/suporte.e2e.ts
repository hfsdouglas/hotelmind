import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../utils/login_as_admin'

test.describe('Suporte (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      ;(window as unknown as { __aberto: string[] }).__aberto = []
      window.open = (url?: string | URL) => {
        ;(window as unknown as { __aberto: string[] }).__aberto.push(
          String(url)
        )
        return null
      }
    })
    await loginAsAdmin(page)
  })

  test('lista os hotéis disponíveis para suporte', async ({ page }) => {
    await page.goto('/suporte')

    await expect(page.getByRole('heading', { name: 'Suporte' })).toBeVisible()
    await expect(
      page.getByRole('cell', { name: 'Grand Palace Hotel' })
    ).toBeVisible()
  })

  test('mantém o botão Acessar desabilitado até escolher um usuário', async ({
    page,
  }) => {
    await page.goto('/suporte')
    await page
      .getByRole('row', { name: /Grand Palace Hotel/ })
      .getByRole('button', { name: 'Acessar' })
      .click()

    const dialogo = page.getByRole('alertdialog')
    await expect(dialogo.getByText('Acessar como...')).toBeVisible()
    await expect(
      dialogo.getByRole('button', { name: 'Acessar' })
    ).toBeDisabled()

    await dialogo.getByLabel('Ana Souza').check()
    await expect(dialogo.getByRole('button', { name: 'Acessar' })).toBeEnabled()
  })

  test('abre o acesso de suporte do usuário escolhido', async ({ page }) => {
    await page.goto('/suporte')
    await page
      .getByRole('row', { name: /Grand Palace Hotel/ })
      .getByRole('button', { name: 'Acessar' })
      .click()

    const dialogo = page.getByRole('alertdialog')
    await dialogo.getByLabel('Ana Souza').check()
    await dialogo.getByRole('button', { name: 'Acessar' }).click()

    await expect(dialogo).toBeHidden()
    const abertos = await page.evaluate(
      () => (window as unknown as { __aberto: string[] }).__aberto
    )
    expect(abertos).toEqual([
      'http://localhost:3000/admin/hoteis/h1/suporte-acesso?usuario_id=u2',
    ])
  })

  test('cancela a escolha sem abrir o acesso', async ({ page }) => {
    await page.goto('/suporte')
    await page
      .getByRole('row', { name: /Grand Palace Hotel/ })
      .getByRole('button', { name: 'Acessar' })
      .click()

    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Cancelar' })
      .click()

    await expect(page.getByRole('alertdialog')).toBeHidden()
  })
})
