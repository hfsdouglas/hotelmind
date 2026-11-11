import { expect, test } from '@playwright/test'
import { login_as_staff } from '../utils/login_as_staff'

test.describe('Usuários (web)', () => {
  test.beforeEach(async ({ page }) => {
    await login_as_staff(page)
  })

  test('lista os usuários do hotel', async ({ page }) => {
    await page.goto('/usuarios')

    await expect(page.getByRole('heading', { name: 'Usuários' })).toBeVisible()
    await expect(page.getByText('Maria Recepcionista')).toBeVisible()
    await expect(page.getByText('carlos@hotelteste.com')).toBeVisible()
  })

  test('cria um usuário e o exibe na listagem', async ({ page }) => {
    await page.goto('/usuarios')
    await expect(page.getByText('Maria Recepcionista')).toBeVisible()
    await page.getByRole('link', { name: 'Novo usuário' }).click()

    await page.getByLabel('Nome completo *').fill('Ana Camareira')
    await page.getByLabel('E-mail *').fill('ana@hotelteste.com')
    await page.getByLabel('Senha *').fill('senha12345')
    await page.getByLabel('Data de nascimento *').fill('1995-03-20')
    await page.getByLabel('Gênero *').fill('Feminino')
    await page.getByLabel('Celular *').fill('11977776666')
    await page.getByLabel('CPF *').fill('11122233344')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Usuário criado com sucesso.')).toBeVisible()
    await expect(page).toHaveURL(/\/usuarios$/)
    await expect(page.getByText('Ana Camareira')).toBeVisible()
  })

  test('mostra erros de validação ao salvar o formulário vazio', async ({
    page,
  }) => {
    await page.goto('/usuarios/novo')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Nome obrigatório')).toBeVisible()
    await expect(page.getByText('E-mail inválido')).toBeVisible()
    await expect(page.getByText('Mínimo 8 caracteres')).toBeVisible()
    await expect(page).toHaveURL(/\/usuarios\/novo$/)
  })

  test('avisa quando o e-mail já está em uso', async ({ page }) => {
    await page.goto('/usuarios/novo')

    await page.getByLabel('Nome completo *').fill('Outra Maria')
    await page.getByLabel('E-mail *').fill('maria@hotelteste.com')
    await page.getByLabel('Senha *').fill('senha12345')
    await page.getByLabel('Data de nascimento *').fill('1992-01-01')
    await page.getByLabel('Gênero *').fill('Feminino')
    await page.getByLabel('Celular *').fill('11955554444')
    await page.getByLabel('CPF *').fill('55544433322')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(
      page.getByText('Já existe um usuário com este e-mail, CPF ou celular.')
    ).toBeVisible()
    await expect(page).toHaveURL(/\/usuarios\/novo$/)
  })

  test('edita um usuário e mostra o novo nome na listagem', async ({
    page,
  }) => {
    await page.goto('/usuarios')
    await page
      .getByRole('row', { name: /Carlos Gerente/ })
      .getByRole('link')
      .click()

    await expect(page.getByLabel('Nome completo')).toHaveValue('Carlos Gerente')
    await page.getByLabel('Nome completo').fill('Carlos Diretor')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Usuário atualizado.')).toBeVisible()
    await expect(page).toHaveURL(/\/usuarios$/)
    await expect(page.getByText('Carlos Diretor')).toBeVisible()
  })
})
