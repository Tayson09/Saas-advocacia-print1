import { test, expect } from './support/electron'
import { DEFAULT_USER, mockLoginError, mockLoginSuccess } from './support/mocks'

test.describe('Login', () => {
  test('exibe erros de validação ao enviar o formulário vazio', async ({ page }) => {
    await expect(page.getByText('Acesse sua conta')).toBeVisible()

    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByText('E-mail é obrigatório')).toBeVisible()
    await expect(page.getByText('Senha é obrigatória')).toBeVisible()
  })

  test('mostra erro de credenciais inválidas', async ({ page }) => {
    await mockLoginError(page, 401, 'AUTH_INVALID_CREDENTIALS', 'E-mail ou senha incorretos')

    await page.getByLabel('E-mail', { exact: true }).fill('ninguem@escritorio.com')
    await page.getByLabel('Senha', { exact: true }).fill('SenhaErrada1!')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByRole('alert')).toContainText('E-mail ou senha incorretos')
    // continua na tela de login
    await expect(page.getByText('Acesse sua conta')).toBeVisible()
  })

  test('mostra mensagem específica para conta inativa', async ({ page }) => {
    await mockLoginError(
      page,
      403,
      'USER_ACCOUNT_DISABLED',
      'Acesso bloqueado. Entre em contato com o administrador.'
    )

    await page.getByLabel('E-mail', { exact: true }).fill('inativo@escritorio.com')
    await page.getByLabel('Senha', { exact: true }).fill('Senha@123')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByRole('alert')).toContainText(
      'Sua conta está inativa. Entre em contato com o administrador do sistema.'
    )
  })

  test('faz login com sucesso e vai direto ao cadastro de usuário (admin)', async ({ page }) => {
    await mockLoginSuccess(page)

    await page.getByLabel('E-mail', { exact: true }).fill(DEFAULT_USER.email)
    await page.getByLabel('Senha', { exact: true }).fill('Senha@123')
    await page.getByRole('button', { name: 'Entrar' }).click()

    // boas-vindas vêm como notificação (pop-up), não como tela
    await expect(page.getByRole('alert').filter({ hasText: 'Acesso liberado' })).toBeVisible()
    // o admin cai direto na tela de cadastro de usuário
    await expect(page.getByRole('heading', { name: 'Cadastrar usuário' })).toBeVisible()
  })

  test('lembra o e-mail quando a opção está marcada', async ({ page }) => {
    await mockLoginSuccess(page)

    await page.getByLabel('E-mail', { exact: true }).fill(DEFAULT_USER.email)
    await page.getByLabel('Senha', { exact: true }).fill('Senha@123')
    await page.getByLabel('Lembrar meu e-mail').check()
    await page.getByRole('button', { name: 'Entrar' }).click()

    // após o login, sai e volta ao login — o e-mail deve vir preenchido
    await page.getByRole('button', { name: 'Sair' }).click()

    await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue(DEFAULT_USER.email)
  })
})
