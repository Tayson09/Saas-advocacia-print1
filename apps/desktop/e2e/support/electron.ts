import {
  test as base,
  expect as baseExpect,
  _electron as electron,
  type ElectronApplication,
  type Page
} from '@playwright/test'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// aponta para o bundle do processo principal gerado por `electron-vite build`
const mainEntry = join(__dirname, '..', '..', 'out', 'main', 'index.js')

interface AppFixtures {
  electronApp: ElectronApplication
  page: Page
}

/**
 * Fixture que sobe o app Electron real (build de produção) com um diretório de
 * dados isolado por teste — garante que localStorage/sessão não vazem entre os
 * casos e que a instalação local do usuário não seja tocada.
 */
export const test = base.extend<AppFixtures>({
  electronApp: async ({}, use) => {
    if (!existsSync(mainEntry)) {
      throw new Error(
        `Build do Electron não encontrado em ${mainEntry}.\n` +
          'Rode `npm run build:e2e` (ou use o script `npm run test:e2e`, que já builda antes).'
      )
    }

    const userDataDir = mkdtempSync(join(tmpdir(), 'advocacia-e2e-'))

    const app = await electron.launch({
      args: [mainEntry, `--user-data-dir=${userDataDir}`],
      env: { ...process.env, NODE_ENV: 'test' }
    })

    await use(app)

    await app.close()
    try {
      rmSync(userDataDir, { recursive: true, force: true })
    } catch {
      // diretório temporário: falha na limpeza não deve quebrar o teste
    }
  },

  page: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await use(page)
  }
})

export const expect = baseExpect

/** Navega para uma rota do HashRouter sem depender de links na UI. */
export async function goToRoute(page: Page, route: string): Promise<void> {
  const normalized = route.startsWith('#') ? route : `#${route}`
  await page.evaluate((hash) => {
    window.location.hash = hash
  }, normalized)
}
