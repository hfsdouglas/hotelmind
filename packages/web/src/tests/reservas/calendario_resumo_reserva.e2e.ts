import { expect, test } from '@playwright/test'
import {
  abrir_calendario,
  barra_de,
  QUARTO_101_ID,
} from '../utils/calendario_reservas'

test.describe('Calendário: cartão de resumo no hover (US5)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir_calendario(page)
  })

  test('mostra o resumo no hover e o esconde ao sair', async ({ page }) => {
    await barra_de(page, QUARTO_101_ID, '2026-12-03').hover()

    const tooltip = page.getByRole('tooltip')
    await expect(tooltip).toContainText('1 Casal, 1 Solteiro')
    await expect(tooltip).toContainText('2 adultos')
    await expect(tooltip).toContainText('R$ 1.500,00')
    await expect(tooltip).toContainText('Chegada tardia')

    await page.mouse.move(0, 0)

    await expect(page.getByText('1 Casal, 1 Solteiro')).toHaveCount(0)
  })

  test('seleciona a reserva ao clicar com o tooltip aberto', async ({
    page,
  }) => {
    const barra = barra_de(page, QUARTO_101_ID, '2026-12-03')
    await barra.hover()
    await expect(page.getByRole('tooltip')).toContainText('RES-0101')

    await barra.click()

    await expect(barra).toHaveAttribute('aria-pressed', 'true')
  })
})
