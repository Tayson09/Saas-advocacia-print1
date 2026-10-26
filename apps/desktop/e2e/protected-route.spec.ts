import { test, expect, goToRoute } from './support/electron'

test.describe('Proteção de rotas', () => {
  test('redireciona para o login ao acessar o dashboard sem sessão', async ({ page }) => {
    await expect(page.getByText('Acesse sua conta')).toBeVisible()

    await goToRoute(page, '/dashboard')

    // a rota privada volta para o login
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Bem-vindo/ })).toHaveCount(0)
  })

  test('redireciona rotas desconhecidas para o login', async ({ page }) => {
    await goToRoute(page, '/rota-que-nao-existe')

    await expect(page.getByText('Acesse sua conta')).toBeVisible()
  })
})
