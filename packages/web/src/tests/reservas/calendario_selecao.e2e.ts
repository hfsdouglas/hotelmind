import { expect, type Locator, type Page, test } from '@playwright/test'
import {
  QUARTO_101_ID,
  QUARTO_102_ID,
} from '../../mocks/quartos/quartos_handlers'
import { REGIME_PENSAO_COMPLETA_ID } from '../../mocks/regimes_alimentacao/regimes_alimentacao_handlers'
import { login_as_staff } from '../utils/login_as_staff'

const DIAS_SELECIONADOS = [
  '2026-12-01',
  '2026-12-02',
  '2026-12-03',
  '2026-12-04',
]

function celula(page: Page, quarto_id: string, dia: string): Locator {
  return page.getByTestId(`calendar-day-cell-${quarto_id}-${dia}`)
}

// Overlay: first child (aria-hidden) of the td's relative container
function overlay_de(td: Locator): Locator {
  return td.locator('div.relative > [aria-hidden="true"]:first-child')
}

async function caixa_de(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Elemento sem bounding box')
  return box
}

async function centro_de(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Célula sem bounding box')
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

async function arrastar_por_linhas(page: Page, passos: Locator[]) {
  const [primeiro, ...demais] = passos
  const inicio = await centro_de(primeiro)
  await page.mouse.move(inicio.x, inicio.y)
  await page.mouse.down()
  for (const passo of demais) {
    const ponto = await centro_de(passo)
    await page.mouse.move(ponto.x, ponto.y, { steps: 5 })
  }
  await page.mouse.up()
}

async function selecionar_101_de_01_a_04(page: Page) {
  await arrastar_por_linhas(page, [
    celula(page, QUARTO_101_ID, '2026-12-01'),
    celula(page, QUARTO_102_ID, '2026-12-04'),
  ])
}

async function esperar_sem_selecao(page: Page) {
  for (const dia of DIAS_SELECIONADOS) {
    await expect(celula(page, QUARTO_101_ID, dia)).not.toHaveAttribute(
      'data-selection'
    )
  }
}

async function preencher_modal_e_salvar(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Nova Reserva' })
  // Clicking the regime is kept on purpose: it works both when the regime is
  // already preselected (re-ticks the suite) and when it is not.
  await dialog.getByRole('button', { name: /Pensão Completa/ }).click()
  await expect(
    dialog.getByText(/Proposta selecionada: Suíte 101/)
  ).toBeVisible()
  await dialog.getByLabel('Nome Completo *').fill('Maria Souza')
  await dialog.getByRole('button', { name: 'Salvar' }).click()
}

test.describe('Calendário: seleção de período e nova reserva em modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 11, 1))
    await login_as_staff(page)
    await page.goto('/reservas/calendario')
    await expect(celula(page, QUARTO_101_ID, '2026-12-01')).toBeVisible()
  })

  test.describe('US1 - seleção por arraste', () => {
    test('seleciona período por arraste apenas na linha da suíte', async ({
      page,
    }) => {
      await selecionar_101_de_01_a_04(page)

      await expect(celula(page, QUARTO_101_ID, '2026-12-01')).toHaveAttribute(
        'data-selection',
        'start'
      )
      await expect(celula(page, QUARTO_101_ID, '2026-12-02')).toHaveAttribute(
        'data-selection',
        'middle'
      )
      await expect(celula(page, QUARTO_101_ID, '2026-12-03')).toHaveAttribute(
        'data-selection',
        'middle'
      )
      await expect(celula(page, QUARTO_101_ID, '2026-12-04')).toHaveAttribute(
        'data-selection',
        'end'
      )
      for (const dia of DIAS_SELECIONADOS) {
        await expect(celula(page, QUARTO_102_ID, dia)).not.toHaveAttribute(
          'data-selection'
        )
      }
    })
  })

  test.describe('US1 - pintura do overlay de seleção', () => {
    test('pinta o overlay com cor e geometria corretas nas células de borda e do meio', async ({
      page,
    }) => {
      await selecionar_101_de_01_a_04(page)

      const inicio = celula(page, QUARTO_101_ID, '2026-12-01')
      const meio = celula(page, QUARTO_101_ID, '2026-12-02')
      const fim = celula(page, QUARTO_101_ID, '2026-12-04')
      await expect(inicio).toHaveAttribute('data-selection', 'start')

      for (const td of [inicio, meio, fim]) {
        await expect(overlay_de(td)).not.toHaveCSS(
          'background-color',
          'rgba(0, 0, 0, 0)'
        )
      }

      const caixa_meio = await caixa_de(overlay_de(meio))
      const td_meio = await caixa_de(meio)
      // A tabela usa border-collapse: a caixa do td inclui metade das bordas
      // vizinhas (~1px), então o overlay inset-0 fica um pouco menor que o td.
      expect(caixa_meio.width / td_meio.width).toBeGreaterThan(0.95)

      for (const td of [inicio, fim]) {
        const caixa_overlay = await caixa_de(overlay_de(td))
        const caixa_td = await caixa_de(td)
        const razao = caixa_overlay.width / caixa_td.width
        expect(razao).toBeGreaterThan(0.25)
        expect(razao).toBeLessThan(0.42)
      }
    })
  })

  test.describe('US1 - cor uniforme e cursor', () => {
    test('usa a mesma cor de fundo no início, meio e fim da seleção', async ({
      page,
    }) => {
      await selecionar_101_de_01_a_04(page)

      const cores = []
      for (const dia of ['2026-12-01', '2026-12-02', '2026-12-04']) {
        const overlay = overlay_de(celula(page, QUARTO_101_ID, dia))
        cores.push(
          await overlay.evaluate(el => getComputedStyle(el).backgroundColor)
        )
      }

      expect(cores[0]).not.toBe('rgba(0, 0, 0, 0)')
      expect(cores[1]).toBe(cores[0])
      expect(cores[2]).toBe(cores[0])
    })

    test('mostra o pointer apenas sobre a barra da reserva, não na célula', async ({
      page,
    }) => {
      // Janela larga o bastante para exibir a reserva existente (20-22/12)
      await page.setViewportSize({ width: 1920, height: 1080 })
      const td = celula(page, QUARTO_101_ID, '2026-12-21')
      const barra = td.getByRole('button')
      await expect(barra).toBeVisible()

      await expect(td).not.toHaveCSS('cursor', 'pointer')
      await expect(barra).toHaveCSS('cursor', 'pointer')
    })
  })

  test.describe('US1 (032) - clique na barra seleciona sem abrir modal', () => {
    test('a barra fica aria-pressed=true e nenhum dialog abre', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      const barra = celula(page, QUARTO_101_ID, '2026-12-21').getByRole(
        'button'
      )

      await barra.click()

      await expect(barra).toHaveAttribute('aria-pressed', 'true')
      await expect(page.getByRole('dialog')).toHaveCount(0)
    })
  })

  test.describe('US2 - remoção ao clicar fora', () => {
    test('remove a seleção ao clicar fora do calendário', async ({ page }) => {
      await selecionar_101_de_01_a_04(page)
      await expect(celula(page, QUARTO_101_ID, '2026-12-01')).toHaveAttribute(
        'data-selection',
        'start'
      )

      await page.getByText('Calendário', { exact: true }).click()
      await esperar_sem_selecao(page)

      await selecionar_101_de_01_a_04(page)
      await expect(celula(page, QUARTO_101_ID, '2026-12-01')).toHaveAttribute(
        'data-selection',
        'start'
      )
      await page.getByRole('button', { name: 'Próximo dia' }).click()
      await expect(celula(page, QUARTO_101_ID, '2026-12-02')).toBeVisible()
      for (const dia of DIAS_SELECIONADOS.slice(1)) {
        await expect(celula(page, QUARTO_101_ID, dia)).not.toHaveAttribute(
          'data-selection'
        )
      }
    })
  })

  test.describe('US3 - nova reserva em modal', () => {
    test('cria reserva pelo modal a partir da seleção', async ({ page }) => {
      await selecionar_101_de_01_a_04(page)

      await page.getByRole('button', { name: 'Nova Reserva' }).click()

      const dialog = page.getByRole('dialog', { name: 'Nova Reserva' })
      await expect(dialog.getByLabel('Data de Check-in *')).toHaveValue(
        '01/12/2026'
      )
      await expect(dialog.getByLabel('Data de Check-out *')).toHaveValue(
        '04/12/2026'
      )
      await preencher_modal_e_salvar(page)

      await expect(
        page.getByText('Reserva RES-0002 cadastrada com sucesso!')
      ).toBeVisible()
      await expect(dialog).toBeHidden()
      await esperar_sem_selecao(page)
    })
  })

  test.describe('US3 - regime e suíte pré-selecionados no modal', () => {
    test('abre com o primeiro regime e a suíte selecionados e salva só com o titular', async ({
      page,
    }) => {
      await selecionar_101_de_01_a_04(page)
      await page.getByRole('button', { name: 'Nova Reserva' }).click()
      const dialog = page.getByRole('dialog', { name: 'Nova Reserva' })

      await expect(
        dialog.getByRole('button', { name: /Pensão Completa/ })
      ).toContainText('Selecionado ✓')
      await expect(
        dialog.getByText(/Proposta selecionada: Suíte 101/)
      ).toBeVisible()
      const requisicao = page.waitForRequest(
        request =>
          request.method() === 'POST' && /\/reservas$/.test(request.url())
      )
      await dialog.getByLabel('Nome Completo *').fill('Maria Souza')
      await dialog.getByRole('button', { name: 'Salvar' }).click()

      const body = (await requisicao).postDataJSON()
      expect(body.quarto_id).toBe(QUARTO_101_ID)
      expect(body.regime_alimentacao_id).toBe(REGIME_PENSAO_COMPLETA_ID)
      expect(body).not.toHaveProperty('hotel_id')
      await expect(
        page.getByText('Reserva RES-0002 cadastrada com sucesso!')
      ).toBeVisible()
    })

    test('não pré-seleciona nada quando aberto sem seleção', async ({
      page,
    }) => {
      await page.getByRole('button', { name: 'Nova Reserva' }).click()
      const dialog = page.getByRole('dialog', { name: 'Nova Reserva' })

      await expect(
        dialog.getByRole('button', { name: /Meia Pensão/ })
      ).toBeVisible()
      await expect(dialog.getByText('Selecionado ✓')).toHaveCount(0)
      await expect(dialog.getByText(/Proposta selecionada/)).toHaveCount(0)
    })
  })

  test.describe('US4 - isolamento entre hotéis', () => {
    test('não envia hotel_id ao criar pelo modal', async ({ page }) => {
      await selecionar_101_de_01_a_04(page)
      await page.getByRole('button', { name: 'Nova Reserva' }).click()
      const requisicao = page.waitForRequest(
        request =>
          request.method() === 'POST' && /\/reservas$/.test(request.url())
      )

      await preencher_modal_e_salvar(page)

      const body = (await requisicao).postDataJSON()
      expect(body).not.toHaveProperty('hotel_id')
      expect(body.quarto_id).toBe(QUARTO_101_ID)
    })
  })

  test.describe('Regimes do modal e rolagem', () => {
    test('mostra apenas os regimes da suíte selecionada', async ({ page }) => {
      await selecionar_101_de_01_a_04(page)
      await page.getByRole('button', { name: 'Nova Reserva' }).click()

      const dialog = page.getByRole('dialog', { name: 'Nova Reserva' })
      await expect(
        dialog.getByRole('button', { name: /Pensão Completa/ })
      ).toBeVisible()
      await expect(
        dialog.getByRole('button', { name: /Meia Pensão/ })
      ).toHaveCount(0)
    })

    test('mostra todos os regimes quando aberto sem seleção', async ({
      page,
    }) => {
      await page.getByRole('button', { name: 'Nova Reserva' }).click()

      const dialog = page.getByRole('dialog', { name: 'Nova Reserva' })
      await expect(
        dialog.getByRole('button', { name: /Pensão Completa/ })
      ).toBeVisible()
      await expect(
        dialog.getByRole('button', { name: /Meia Pensão/ })
      ).toBeVisible()
    })

    test('esconde a barra de rolagem do modal mantendo a rolagem', async ({
      page,
    }) => {
      await selecionar_101_de_01_a_04(page)
      await page.getByRole('button', { name: 'Nova Reserva' }).click()

      const dialog = page.getByRole('dialog', { name: 'Nova Reserva' })
      await expect(dialog).toBeVisible()
      await expect(dialog).toHaveCSS('scrollbar-width', 'none')
      await expect(dialog).toHaveCSS('overflow-y', 'auto')
    })

    test('não envia hotel_id ao carregar os regimes da suíte', async ({
      page,
    }) => {
      const urls: string[] = []
      page.on('request', request => urls.push(request.url()))
      await selecionar_101_de_01_a_04(page)
      await page.getByRole('button', { name: 'Nova Reserva' }).click()

      await expect(
        page
          .getByRole('dialog', { name: 'Nova Reserva' })
          .getByRole('button', { name: /Pensão Completa/ })
      ).toBeVisible()
      expect(urls.some(url => /\/tarifarios\?/.test(url))).toBe(true)
      expect(urls.some(url => url.includes('hotel_id'))).toBe(false)
    })
  })
})
