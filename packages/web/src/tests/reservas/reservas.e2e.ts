import { expect, test } from '@playwright/test'
import { login_as_staff } from '../utils/login_as_staff'

test.describe('Reservas (web)', () => {
  test.beforeEach(async ({ page }) => {
    await login_as_staff(page)
  })

  test('lista as reservas com código, titular, período e status', async ({
    page,
  }) => {
    await page.goto('/reservas')

    await expect(
      page.getByRole('heading', { name: 'Gestão de Reservas' })
    ).toBeVisible()
    const linha = page.getByRole('row', { name: /RES-0001/ })
    await expect(linha).toContainText('Renata Vasconcellos')
    await expect(linha).toContainText('20/12/2026')
    await expect(linha).toContainText('Confirmada')
    await expect(linha).toContainText('1 de 2 preenchida(s)')
  })

  test('abre o formulário de nova reserva pelo botão da listagem', async ({
    page,
  }) => {
    await page.goto('/reservas')
    await page.getByRole('link', { name: 'Nova Reserva' }).click()

    await expect(page).toHaveURL(/\/reservas\/nova$/)
  })

  test('exibe o calendário com os quartos e a navegação de datas', async ({
    page,
  }) => {
    await page.goto('/reservas/calendario')

    await expect(page.getByText('101', { exact: true })).toBeVisible()
    await expect(page.getByText('102', { exact: true })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Selecionar mês e ano' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Próximo dia' })
    ).toBeVisible()
  })
})
