import type { Page, Route } from '@playwright/test'

// Payloads espelham os formatos reais da API (apps/api) para que os mocks
// exerçam exatamente o mesmo caminho de código do cliente HTTP.

export interface MockUser {
  id: string
  name: string
  email: string
  role: string
}

export const DEFAULT_USER: MockUser = {
  id: 'user-e2e-1',
  name: 'Dra. Ana Advogada',
  email: 'ana@escritorio.com',
  role: 'ADMIN'
}

export interface ApiErrorDetail {
  location: string
  path: string
  message: string
}

function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body)
  })
}

/** POST /api/auth/login -> 200 com tokens + usuário. */
export async function mockLoginSuccess(page: Page, user: MockUser = DEFAULT_USER): Promise<void> {
  await page.route('**/api/auth/login', (route) =>
    fulfillJson(route, 200, {
      accessToken: 'access-token-e2e',
      refreshRawToken: 'refresh-token-e2e',
      user
    })
  )
}

/** POST /api/auth/login -> erro (ex.: 401 AUTH_INVALID_CREDENTIALS, 403 USER_ACCOUNT_DISABLED). */
export async function mockLoginError(
  page: Page,
  status: number,
  code: string,
  message: string
): Promise<void> {
  await page.route('**/api/auth/login', (route) =>
    fulfillJson(route, status, { status: 'error', code, message })
  )
}

/** GET /api/setup/status -> indica se o cadastro inicial ainda está aberto. */
export async function mockSetupStatus(page: Page, registrationOpen: boolean): Promise<void> {
  await page.route('**/api/setup/status', (route) =>
    fulfillJson(route, 200, { registrationOpen })
  )
}

/** POST /api/setup/admin -> 201 com o administrador criado. */
export async function mockRegisterAdminSuccess(
  page: Page,
  admin: Partial<MockUser> = {}
): Promise<void> {
  await page.route('**/api/setup/admin', (route) =>
    fulfillJson(route, 201, {
      id: 'admin-e2e-1',
      name: admin.name ?? DEFAULT_USER.name,
      email: admin.email ?? DEFAULT_USER.email,
      role: admin.role ?? 'ADMIN',
      createdAt: '2026-01-01T00:00:00.000Z'
    })
  )
}

/** POST /api/setup/admin -> erro (ex.: 409 UNIQUE_CONSTRAINT, 403 REGISTRATION_CLOSED). */
export async function mockRegisterAdminError(
  page: Page,
  status: number,
  code: string,
  message: string,
  details?: ApiErrorDetail[]
): Promise<void> {
  await page.route('**/api/setup/admin', (route) =>
    fulfillJson(route, status, { status: 'error', code, message, details })
  )
}

/** POST /api/user/register -> 201 com o usuário criado + indicação de envio do e-mail. */
export async function mockRegisterUserSuccess(
  page: Page,
  options: { user?: Partial<MockUser>; emailSent?: boolean } = {}
): Promise<void> {
  await page.route('**/api/user/register', (route) =>
    fulfillJson(route, 201, {
      user: {
        id: options.user?.id ?? 'user-e2e-novo',
        name: options.user?.name ?? 'Carlos Advogado',
        email: options.user?.email ?? 'carlos@escritorio.com',
        role: options.user?.role ?? 'LAWYER'
      },
      emailSent: options.emailSent ?? true
    })
  )
}

/** POST /api/user/register -> erro (ex.: 409 EMAIL_ALREADY_EXISTS, 403 FORBIDDEN). */
export async function mockRegisterUserError(
  page: Page,
  status: number,
  code: string,
  message: string,
  details?: ApiErrorDetail[]
): Promise<void> {
  await page.route('**/api/user/register', (route) =>
    fulfillJson(route, status, { status: 'error', code, message, details })
  )
}
