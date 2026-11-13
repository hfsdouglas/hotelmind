import { expect, type Locator, type Page } from '@playwright/test'
import {
  QUARTO_101_ID,
  QUARTO_102_ID,
} from '../../mocks/quartos/quartos_handlers'
import { login_as_staff } from './login_as_staff'

export { QUARTO_101_ID, QUARTO_102_ID }

export function celula(page: Page, quarto_id: string, dia: string): Locator {
  return page.getByTestId(`calendar-day-cell-${quarto_id}-${dia}`)
}

export function barra_de(page: Page, quarto_id: string, dia: string): Locator {
  return celula(page, quarto_id, dia).getByRole('button')
}

/** Indicador (dot) de status da suíte; o primeiro `data-status` da linha. */
export function ponto_da_suite(page: Page, numero: string): Locator {
  return page
    .locator('tr', { has: page.getByText(numero, { exact: true }) })
    .locator('[data-status]')
    .first()
}

/** Todas as barras de uma reserva (uma por dia ocupado). */
export function barras_da_reserva(page: Page, reserva_id: string): Locator {
  return page.locator(`[data-reserva-id="${reserva_id}"]`)
}

export async function abrir_calendario(page: Page) {
  await page.clock.setFixedTime(new Date(2026, 11, 1))
  await login_as_staff(page)
  await page.goto('/reservas/calendario')
  await expect(celula(page, QUARTO_101_ID, '2026-12-01')).toBeVisible()
}
