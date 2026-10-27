import type { Page } from '@playwright/test'
import { test, expect, goToRoute } from './support/electron'
import { mockCompleteSetupError, mockCompleteSetupSuccess } from './support/mocks'

const SENHA = 'Senha@123'

async function preencherSenhas(page: Page, senha = SENHA, confirmacao = SENHA): Promise<void> {
  await page.getByLabel('Senha', { exact: true }).fill(senha)
  await page.getByLabel('Confirme sua senha').fill(confirmacao)
}

test.describe('Definir senha (convite)', () => {
  test('define a senha com sucesso e volta ao login', async ({ page }) => {
    await mockCompleteSetupSuccess(page)
    await goToRoute(page, '/complete-setup?token=token-valido')

    await expect(page.getByText('Crie sua senha de acesso')).toBeVisible()
    await preencherSenhas(page)
    await page.getByRole('button', { name: 'Definir senha e ativar conta' }).click()

    await expect(page.getByRole('alert').filter({ hasText: 'Tudo certo' })).toBeVisible()
    await expect(page.getByText('Acesse sua conta')).toBeVisible()
  })

  test('mostra link inválido quando não há token', async ({ page }) => {
    await goToRoute(page, '/complete-setup')

    await expect(page.getByText('Link inválido')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ir para o login' })).toBeVisible()
  })

  test('avisa quando o token está expirado ou já utilizado', async ({ page }) => {
    await mockCompleteSetupError(
      page,
      400,
      'INVALID_PASSWORD_SETUP_TOKEN',
      'Token de configuração inválido ou expirado'
    )
    await goToRoute(page, '/complete-setup?token=token-expirado')

    await preencherSenhas(page)
    await page.getByRole('button', { name: 'Definir senha e ativar conta' }).click()

    // a mensagem aparece no alerta do formulário e também na notificação
    await expect(
      page.getByRole('main').getByText(/expirou ou já foi utilizado/)
    ).toBeVisible()
    await expect(
      page.getByRole('alert').filter({ hasText: 'Link expirado' })
    ).toBeVisible()
  })

  test('valida divergência entre as senhas', async ({ page }) => {
    await goToRoute(page, '/complete-setup?token=token-valido')

    await preencherSenhas(page, SENHA, 'Outra@123')
    await page.getByRole('button', { name: 'Definir senha e ativar conta' }).click()

    await expect(page.getByText('As senhas não coincidem')).toBeVisible()
  })
})
