import { test, expect } from './support/electron'

/**
 * Smoke test contra o BACKEND REAL (API Express + PostgreSQL).
 *
 * Diferente dos demais specs, aqui NÃO há mock de rede: o app conversa com a
 * API de verdade em http://localhost:3000. Por isso o teste só roda quando a
 * variável de ambiente E2E_REAL_BACKEND está definida.
 *
 * Pré-requisitos (ver README em e2e/):
 *   1. `docker compose up -d` na raiz (PostgreSQL)
 *   2. `npm run dev` em apps/api (API no ar em localhost:3000)
 *   3. PowerShell:  $env:E2E_REAL_BACKEND = '1'; npm run test:e2e
 */
test.describe('Smoke - backend real', () => {
  test.skip(
    !process.env.E2E_REAL_BACKEND,
    'Defina E2E_REAL_BACKEND=1 e tenha a API rodando em localhost:3000 para executar.'
  )

  test('rejeita credenciais inválidas vindas da API real', async ({ page }) => {
    await expect(page.getByText('Acesse sua conta')).toBeVisible()

    await page.getByLabel('E-mail', { exact: true }).fill('inexistente@escritorio.com')
    await page.getByLabel('Senha', { exact: true }).fill('SenhaQueNaoExiste1!')
    await page.getByRole('button', { name: 'Entrar' }).click()

    // a resposta real da API percorre todo o cliente HTTP e exibe um alerta
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Bem-vindo/ })).toHaveCount(0)
  })
})
