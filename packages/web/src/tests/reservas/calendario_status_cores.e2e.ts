import { expect, test } from '@playwright/test'
import {
  abrir_calendario,
  barra_de,
  ponto_da_suite,
  QUARTO_101_ID,
  QUARTO_102_ID,
} from '../utils/calendario_reservas'

test.describe('Calendário e listagem: cores de status e ícones (US6)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir_calendario(page)
  })

  test('distingue a barra em check-in da barra confirmada', async ({
    page,
  }) => {
    const em_check_in = barra_de(page, QUARTO_102_ID, '2026-12-06')
    const confirmada = barra_de(page, QUARTO_101_ID, '2026-12-03')

    await expect(em_check_in).toHaveAttribute('data-status', 'check_in')
    const cor_check_in = await em_check_in.evaluate(
      el => getComputedStyle(el).backgroundColor
    )
    const cor_confirmada = await confirmada.evaluate(
      el => getComputedStyle(el).backgroundColor
    )
    expect(cor_check_in).not.toBe('rgba(0, 0, 0, 0)')
    expect(cor_check_in).not.toBe(cor_confirmada)
  })

  test('mostra o ponto da suíte 102 como check-in com tooltip', async ({
    page,
  }) => {
    const ponto = ponto_da_suite(page, '102')
    await expect(ponto).toHaveAttribute('data-status', 'checkin')

    await ponto.hover()

    await expect(page.getByText('Check-in').first()).toBeVisible()
    await expect(page.getByRole('tooltip')).toContainText('Check-in')
  })

  test('mostra os ícones da barra de ações na ordem', async ({ page }) => {
    const nova = page.getByRole('button', { name: 'Nova Reserva' })
    const check_in = page.getByRole('button', { name: 'Check-in' })
    const detalhes = page.getByRole('button', { name: 'Detalhes' })

    await expect(nova.locator('svg')).toHaveClass(/lucide-calendar-plus/)
    await expect(check_in.locator('svg')).toHaveClass(/lucide-bell-ring/)
    await expect(detalhes.locator('svg')).toHaveClass(/lucide-info/)
    const x = async (l: typeof nova) => (await l.boundingBox())?.x ?? 0
    expect(await x(nova)).toBeLessThan(await x(check_in))
    expect(await x(check_in)).toBeLessThan(await x(detalhes))
  })

  test('mostra o selo laranja de Check-in na listagem', async ({ page }) => {
    await page.goto('/reservas')

    const selo = page
      .getByRole('row', { name: /RES-0104/ })
      .getByText('Check-in')

    await expect(selo).toBeVisible()
    await expect(selo).toHaveClass(/text-status-checkin-foreground/)
  })
})
