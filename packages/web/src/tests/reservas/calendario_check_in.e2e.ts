import { expect, test } from '@playwright/test'
import {
  abrir_calendario,
  barra_de,
  barras_da_reserva,
  ponto_da_suite,
  QUARTO_101_ID,
} from '../utils/calendario_reservas'

test.describe('Calendário: check-in da reserva selecionada (US2, US7)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir_calendario(page)
  })

  test('faz o check-in de uma reserva confirmada sem enviar hotel_id', async ({
    page,
  }) => {
    await barra_de(page, QUARTO_101_ID, '2026-12-03').click()
    await page.getByRole('button', { name: 'Check-in' }).click()
    const dialog = page.getByRole('dialog', { name: 'Confirmar check-in' })
    await expect(dialog.getByText('Chegada tardia')).toBeVisible()
    await expect(dialog.getByText(/Check-in antecipado/)).toBeVisible()
    const requisicao = page.waitForRequest(
      request =>
        request.method() === 'PATCH' &&
        /\/reservas\/reserva-101\/status$/.test(request.url())
    )

    await dialog.getByRole('button', { name: 'Confirmar check-in' }).click()

    expect((await requisicao).postDataJSON()).toEqual({ status: 'check_in' })
    await expect(
      page.getByText('Check-in da reserva RES-0101 realizado com sucesso!')
    ).toBeVisible()
    await expect(barra_de(page, QUARTO_101_ID, '2026-12-03')).toHaveAttribute(
      'data-status',
      'check_in'
    )
    await expect(
      barras_da_reserva(page, 'reserva-101').first()
    ).toHaveAttribute('data-status', 'check_in')
    await expect(ponto_da_suite(page, '101')).toHaveAttribute(
      'data-status',
      'checkin'
    )
  })

  test('desabilita o check-in para reserva a confirmar', async ({ page }) => {
    await page.getByRole('button', { name: 'Avançar 15 dias' }).click()
    await page.getByRole('button', { name: 'Voltar 15 dias' }).click()
    await barra_de(page, QUARTO_101_ID, '2026-12-07').click()

    await expect(page.getByRole('button', { name: 'Check-in' })).toBeDisabled()
  })
})
