import { expect, test } from '@playwright/test'
import {
  abrir_calendario,
  barra_de,
  QUARTO_102_ID,
} from '../utils/calendario_reservas'

test.describe('Calendário: detalhes da reserva selecionada (US4)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir_calendario(page)
  })

  test('desabilita Detalhes sem seleção', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Detalhes' })).toBeDisabled()
  })

  test('mostra dados reais e abre a reserva pelo link', async ({ page }) => {
    await barra_de(page, QUARTO_102_ID, '2026-12-02').click()

    await page.getByRole('button', { name: 'Detalhes' }).click()

    const dialog = page.getByRole('dialog', { name: 'Detalhes da Reserva' })
    await expect(dialog.getByText('Agência Sol')).toBeVisible()
    await expect(dialog.getByText('R$ 980,50')).toBeVisible()

    await dialog.getByRole('link', { name: 'Abrir reserva' }).click()

    await expect(page).toHaveURL(/\/reservas\/reserva-102$/)
  })
})
