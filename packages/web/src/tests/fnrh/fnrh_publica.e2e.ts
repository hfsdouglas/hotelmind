import { expect, test } from '@playwright/test'

test.describe('FNRH pública (web)', () => {
  test('exibe o resumo da hospedagem e as fichas dos hóspedes', async ({
    page,
  }) => {
    await page.goto('/fnrh/fnrh-valido')

    await expect(
      page.getByRole('heading', { name: 'Hotel Fazenda Paraíso' })
    ).toBeVisible()
    await expect(page.getByText('Dados da Hospedagem')).toBeVisible()
    await expect(page.getByText('Renata Vasconcellos').first()).toBeVisible()
    await expect(page.getByText('20/12/2026 a 22/12/2026')).toBeVisible()
    await expect(page.getByText('1/2 preenchida(s)')).toBeVisible()
  })

  test('mostra ficha indisponível para token inválido', async ({ page }) => {
    await page.goto('/fnrh/token-inexistente')

    await expect(
      page.getByRole('heading', { name: 'Ficha não disponível' })
    ).toBeVisible({ timeout: 20_000 }) // react-query retries failed requests first
  })
})
