import { expect, test } from '@playwright/test'
import {
  abrir_calendario,
  barra_de,
  QUARTO_102_ID,
} from '../utils/calendario_reservas'

async function abrir_check_in_da_102(page: import('@playwright/test').Page) {
  await barra_de(page, QUARTO_102_ID, '2026-12-02').click()
  await page.getByRole('button', { name: 'Check-in' }).click()
  const dialog = page.getByRole('dialog', { name: 'Confirmar check-in' })
  await expect(dialog.getByText('2 fichas FNRH pendentes')).toBeVisible()
  return dialog
}

test.describe('Calendário: check-in com fichas FNRH pendentes (US3)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir_calendario(page)
  })

  test('faz o check-in e abre a ficha do primeiro hóspede pendente', async ({
    page,
  }) => {
    const dialog = await abrir_check_in_da_102(page)

    await dialog
      .getByRole('button', { name: 'Fazer check-in e preencher FNRHs' })
      .click()

    await expect(page).toHaveURL(/\/reservas\/reserva-102$/)
    await expect(
      page.getByRole('dialog', { name: /Ficha FNRH - Hóspede Titular/ })
    ).toBeVisible()

    await page.goBack()

    await expect(barra_de(page, QUARTO_102_ID, '2026-12-02')).toHaveAttribute(
      'data-status',
      'check_in'
    )
  })

  test('faz o check-in sem preencher e permanece no calendário', async ({
    page,
  }) => {
    const dialog = await abrir_check_in_da_102(page)

    await dialog
      .getByRole('button', { name: 'Fazer check-in sem preencher' })
      .click()

    await expect(barra_de(page, QUARTO_102_ID, '2026-12-02')).toHaveAttribute(
      'data-status',
      'check_in'
    )
    await expect(page).toHaveURL(/\/reservas\/calendario$/)
  })
})
