# Testes E2E (Electron + Playwright)

Testes end-to-end que sobem o **app Electron de produção** e dirigem a interface
React real (telas de login, cadastro do administrador, dashboard e proteção de
rotas).

## Estrutura

```
e2e/
├── support/
│   ├── electron.ts   # fixture que builda/sobe o Electron e isola os dados por teste
│   └── mocks.ts      # respostas simuladas da API (espelham os formatos reais)
├── login.spec.ts             # login: validação, erros, sucesso, lembrar e-mail
├── cadastro-admin.spec.ts    # cadastro do 1º admin: sucesso, bloqueio, duplicado, validação
├── protected-route.spec.ts   # guardas de rota (dashboard sem sessão -> login)
└── smoke.real-backend.spec.ts # smoke opcional contra a API real
```

## Duas estratégias de backend

1. **Suíte principal (mockada)** — padrão. O Playwright intercepta as chamadas
   HTTP do renderer e devolve respostas simuladas. Não precisa de Docker,
   PostgreSQL nem da API no ar. Determinística e pronta para CI.

2. **Smoke contra backend real** (`smoke.real-backend.spec.ts`) — opcional, só
   roda com `E2E_REAL_BACKEND=1`. Exercita o caminho completo contra a API
   Express + PostgreSQL de verdade.

## Como rodar (PowerShell, dentro de `apps/desktop`)

Instale as dependências uma vez (inclui o `@playwright/test`):

```powershell
npm install
```

> Não é necessário `npx playwright install`: os testes usam o Electron do
> próprio projeto, não os navegadores baixados pelo Playwright.

### Suíte mockada (recomendada)

```powershell
npm run test:e2e
```

O script faz o build (`electron-vite build`) e então executa o Playwright.
Relatório HTML: `npm run test:e2e:report`.

### Incluindo o smoke contra o backend real

Em terminais separados, a partir da raiz do repositório:

```powershell
docker compose up -d          # PostgreSQL
cd .\apps\api; npm run dev    # API em localhost:3000
```

Depois, em `apps/desktop`:

```powershell
$env:E2E_REAL_BACKEND = '1'
npm run test:e2e
```

Para voltar a ignorar o smoke, limpe a variável: `Remove-Item Env:E2E_REAL_BACKEND`.
