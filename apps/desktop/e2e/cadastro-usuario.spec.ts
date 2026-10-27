import type { Page } from '@playwright/test'
import { test, expect } from './support/electron'
import {
  DEFAULT_USER,
  mockLoginSuccess,
  mockRegisterUserError,
  mockRegisterUserSuccess,
  type MockUser
} from './support/mocks'

const NOVO_USUARIO = {
  name: 'Carlos Advogado',
  email: 'carlos@escritorio.com',
  role: 'LAWYER'
}

// faz login como admin — que já cai direto na tela de cadastro de usuário
async function irParaCadastroUsuario(page: Page, user: MockUser = DEFAULT_USER): Promise<void> {
  await mockLoginSuccess(page, user)

  await page.getByLabel('E-mail', { exact: true }).fill(user.email)
  await page.getByLabel('Senha', { exact: true }).fill('Senha@123')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page.getByRole('heading', { name: 'Cadastrar usuário' })).toBeVisible()
}

async function preencherFormulario(page: Page): Promise<void> {
  await page.getByLabel('Nome completo').fill(NOVO_USUARIO.name)
  await page.getByLabel('E-mail', { exact: true }).fill(NOVO_USUARIO.email)
  // caixa de seleção customizada: abre e escolhe a opção pelo rótulo
  await page.getByRole('button', { name: 'Perfil de acesso' }).click()
  await page.getByRole('option', { name: 'Advogado(a)' }).click()
}

test.describe('Cadastro de usuário', () => {
  test('cadastra um usuário com sucesso e notifica o administrador', async ({ page }) => {
    await irParaCadastroUsuario(page)
    await mockRegisterUserSuccess(page, { user: NOVO_USUARIO, emailSent: true })

    await preencherFormulario(page)
    await page.getByRole('button', { name: 'Cadastrar usuário' }).click()

    const toast = page.getByRole('alert').filter({ hasText: 'Usuário cadastrado' })
    await expect(toast).toBeVisible()
    await expect(toast).toContainText(NOVO_USUARIO.email)

    // o formulário é limpo para permitir um novo cadastro
    await expect(page.getByLabel('Nome completo')).toHaveValue('')
  })

  test('avisa quando o usuário é criado mas o e-mail de convite não é enviado', async ({ page }) => {
    await irParaCadastroUsuario(page)
    await mockRegisterUserSuccess(page, { user: NOVO_USUARIO, emailSent: false })

    await preencherFormulario(page)
    await page.getByRole('button', { name: 'Cadastrar usuário' }).click()

    await expect(
      page.getByRole('alert').filter({ hasText: 'e-mail não enviado' })
    ).toBeVisible()
  })

  test('mostra erro quando o e-mail já está cadastrado', async ({ page }) => {
    await irParaCadastroUsuario(page)
    await mockRegisterUserError(page, 409, 'EMAIL_ALREADY_EXISTS', 'Este e-mail já está cadastrado')

    await preencherFormulario(page)
    await page.getByRole('button', { name: 'Cadastrar usuário' }).click()

    // a mensagem aparece tanto no erro do campo quanto na notificação
    await expect(page.locator('.ui-field__error')).toHaveText('Este e-mail já está cadastrado')
    await expect(
      page.getByRole('alert').filter({ hasText: 'Este e-mail já está cadastrado' })
    ).toBeVisible()
  })

  test('valida os campos obrigatórios antes de enviar', async ({ page }) => {
    await irParaCadastroUsuario(page)

    await page.getByRole('button', { name: 'Cadastrar usuário' }).click()

    await expect(page.getByText('Nome é obrigatório')).toBeVisible()
    await expect(page.getByText('E-mail é obrigatório')).toBeVisible()
    await expect(page.getByText('Selecione um perfil de acesso')).toBeVisible()
  })
})
