import type { Page } from '@playwright/test'
import { test, expect, goToRoute } from './support/electron'
import {
  mockRegisterAdminError,
  mockRegisterAdminSuccess,
  mockSetupStatus
} from './support/mocks'

const NOVO_ADMIN = {
  name: 'Carlos Advogado',
  email: 'carlos@escritorio.com',
  password: 'Senha@123'
}

async function preencherFormulario(page: Page): Promise<void> {
  await page.getByLabel('Nome completo').fill(NOVO_ADMIN.name)
  await page.getByLabel('E-mail', { exact: true }).fill(NOVO_ADMIN.email)
  await page.getByLabel('Senha', { exact: true }).fill(NOVO_ADMIN.password)
  await page.getByLabel('Confirme sua senha').fill(NOVO_ADMIN.password)
  await page.getByRole('checkbox').check()
}

test.describe('Cadastro do administrador', () => {
  test('cria o primeiro administrador com sucesso', async ({ page }) => {
    await mockSetupStatus(page, true)
    await mockRegisterAdminSuccess(page, { name: NOVO_ADMIN.name, email: NOVO_ADMIN.email })

    await page.getByRole('button', { name: 'Cadastrar administrador' }).click()
    await expect(page.getByText('Cadastro do administrador')).toBeVisible()

    await preencherFormulario(page)
    await page.getByRole('button', { name: 'Criar conta do administrador' }).click()

    await expect(page.getByText('Cadastro concluído')).toBeVisible()
    await expect(page.getByText(NOVO_ADMIN.email)).toBeVisible()
  })

  test('redireciona para a tela de bloqueio quando o cadastro já foi feito', async ({ page }) => {
    await mockSetupStatus(page, false)

    await page.getByRole('button', { name: 'Cadastrar administrador' }).click()

    await expect(page.getByText('O autocadastro está indisponível')).toBeVisible()
  })

  test('mostra erro quando o e-mail já está cadastrado', async ({ page }) => {
    await mockSetupStatus(page, true)
    await mockRegisterAdminError(
      page,
      409,
      'UNIQUE_CONSTRAINT',
      'Já existe um registro com esses dados'
    )

    await page.getByRole('button', { name: 'Cadastrar administrador' }).click()
    await expect(page.getByText('Cadastro do administrador')).toBeVisible()

    await preencherFormulario(page)
    await page.getByRole('button', { name: 'Criar conta do administrador' }).click()

    await expect(page.getByText('Este e-mail já está cadastrado')).toBeVisible()
  })

  test('valida os campos obrigatórios antes de enviar', async ({ page }) => {
    await mockSetupStatus(page, true)

    await goToRoute(page, '/cadastro-admin')
    await expect(page.getByText('Cadastro do administrador')).toBeVisible()

    await page.getByRole('button', { name: 'Criar conta do administrador' }).click()

    await expect(page.getByText('Nome é obrigatório')).toBeVisible()
    await expect(page.getByText('É necessário aceitar os termos')).toBeVisible()
  })
})
