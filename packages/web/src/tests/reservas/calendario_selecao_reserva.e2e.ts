import { expect, test } from '@playwright/test'
import {
  abrir_calendario,
  barra_de,
  QUARTO_101_ID,
  QUARTO_102_ID,
} from '../utils/calendario_reservas'

test.describe('Calendário: seleção de reserva (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir_calendario(page)
  })

  test('seleciona a reserva ao clicar na barra, sem abrir dialog', async ({
    page,
  }) => {
    const barra = barra_de(page, QUARTO_101_ID, '2026-12-03')

    await barra.click()

    await expect(barra).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('move o destaque para outra reserva e limpa com Esc', async ({
    page,
  }) => {
    const barra_101 = barra_de(page, QUARTO_101_ID, '2026-12-03')
    const barra_102 = barra_de(page, QUARTO_102_ID, '2026-12-02')
    await barra_101.click()

    await barra_102.click()

    await expect(barra_102).toHaveAttribute('aria-pressed', 'true')
    await expect(barra_101).toHaveAttribute('aria-pressed', 'false')

    await page.keyboard.press('Escape')

    await expect(barra_102).toHaveAttribute('aria-pressed', 'false')
  })

  test('mantém o anel da primeira linha totalmente dentro da grade, abaixo do cabeçalho', async ({
    page,
  }) => {
    const barra = barra_de(page, QUARTO_101_ID, '2026-12-03')
    await barra.click()
    await expect(barra).toHaveAttribute('aria-pressed', 'true')

    const caixa_barra = await barra.boundingBox()
    const caixa_cabecalho = await page.locator('thead').boundingBox()
    const caixa_grade = await page
      .locator('table')
      .locator('xpath=..')
      .boundingBox()
    if (!caixa_barra || !caixa_cabecalho || !caixa_grade) {
      throw new Error('Elemento sem bounding box')
    }

    const margem = 3
    expect(caixa_barra.y - margem).toBeGreaterThanOrEqual(
      caixa_cabecalho.y + caixa_cabecalho.height
    )
    expect(caixa_barra.y - margem).toBeGreaterThanOrEqual(caixa_grade.y)
    expect(caixa_barra.y + caixa_barra.height + margem).toBeLessThanOrEqual(
      caixa_grade.y + caixa_grade.height
    )
    expect(caixa_barra.x - margem).toBeGreaterThanOrEqual(caixa_grade.x)
    expect(caixa_barra.x + caixa_barra.width + margem).toBeLessThanOrEqual(
      caixa_grade.x + caixa_grade.width
    )
  })
})
