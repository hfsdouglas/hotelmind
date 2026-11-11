import { expect, test } from '@playwright/test'

test.describe('Orçamento público (web)', () => {
  test('exibe a proposta ao abrir o link do orçamento', async ({ page }) => {
    await page.goto('/orcamento/orcamento-valido')

    await expect(page.getByText('Olá, Renata Vasconcellos!')).toBeVisible()
    await expect(page.getByText('Chalé Família')).toBeVisible()
    await expect(page.getByText('Pensão Completa')).toBeVisible()
    await expect(page.getByText('2 Adultos')).toBeVisible()
    await expect(page.getByText('1 Criança')).toBeVisible()
    await expect(page.getByText('20/12/2026').first()).toBeVisible()
    await expect(page.getByText('R$ 1.000,00').first()).toBeVisible()
  })

  test('mostra mensagem de proposta não encontrada para token inválido', async ({
    page,
  }) => {
    await page.goto('/orcamento/token-inexistente')

    await expect(
      page.getByRole('heading', { name: 'Proposta não encontrada' })
    ).toBeVisible({ timeout: 20_000 }) // react-query retries failed requests first
  })
})
