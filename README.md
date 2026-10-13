# SaaS Advocacia

Sistema desktop de gestão jurídica em desenvolvimento, destinado à organização de escritórios de advocacia, com funcionalidades previstas para usuários, clientes, processos, tarefas, compromissos e documentos.

## Stack tecnológica

- **Desktop:** Electron, React e TypeScript.
- **Backend:** Node.js, Express e TypeScript.
- **Banco de dados:** PostgreSQL.
- **ORM e migrations:** Prisma.
- **Validação:** Zod.
- **Infraestrutura local:** Docker e Docker Compose.

## Pré-requisitos

Confira se as ferramentas estão disponíveis no terminal:

```powershell
git --version
node -v
npm -v
docker --version
docker compose version
```

O Docker Desktop deve estar iniciado antes de levantar o banco de dados.

## 1. Clonar o repositório

No PowerShell, execute:

```powershell
git clone <URL_DO_REPOSITORIO>
cd <NOME_DA_PASTA_DO_REPOSITORIO>
```

Todos os comandos referentes ao Docker Compose deste guia devem ser executados a partir da raiz do repositório.

## 2. Configurar as variáveis de ambiente

Cada desenvolvedor deve manter seus próprios arquivos `.env` locais.

### 2.1. Configurar o Docker e o PostgreSQL

Na raiz do projeto, copie o arquivo de exemplo:

```powershell
Copy-Item .env.example .env
```

Abra o arquivo `.env` e configure os valores locais:

```dotenv
COMPOSE_FILE=./infrastructure/docker-compose.yml

POSTGRES_PORT=5433
POSTGRES_DB=sistema_advocacia
POSTGRES_USER=sistema_dev
POSTGRES_PASSWORD=defina_sua_senha_local
```

Ajuste a senha antes de iniciar o banco.

A porta `5433` é a porta da máquina local. Se ela estiver ocupada, escolha outra porta disponível.

### 2.2. Configurar o backend

Copie o arquivo de exemplo da API:

```powershell
Copy-Item .\apps\api\.env.example .\apps\api\.env
```

Abra `apps/api/.env` e configure:

```dotenv
PORT=3000
DATABASE_URL="postgresql://USUARIO_AQUI:SENHA_AQUI@localhost:PORTA_DA_ENV/NOME_DO_DB_AQUI?schema=public"
```

**Importante:** substitua `SUA_SENHA` pela mesma senha configurada em `POSTGRES_PASSWORD` no `.env` da raiz.

O usuário, o banco e a porta na `DATABASE_URL` também devem corresponder aos valores configurados para o PostgreSQL.

## 3. Iniciar o PostgreSQL

Com o Docker Desktop aberto, execute na raiz do repositório:

```powershell
docker compose up -d
```

O Compose utilizará o arquivo indicado por `COMPOSE_FILE`.

Confira o estado dos contêineres:

```powershell
docker compose ps
```

Para acompanhar os logs do PostgreSQL:

```powershell
docker compose logs -f postgres
```

Quando terminar de acompanhar os logs, pressione `Ctrl + C`.

Isso encerra o acompanhamento dos logs, não o banco de dados.

O PostgreSQL deve estar saudável e aceitando conexões antes de iniciar a API.

## 4. Preparar o backend

Entre na pasta da API:

```powershell
cd .\apps\api
```

Instale as dependências:

```powershell
npm ci
```

Gere o Prisma Client:

```powershell
npx prisma generate
```

### Preparar o banco com Prisma Migrate

As migrations devem ser compartilhadas pelo Git, dentro de `apps/api/prisma/migrations/`.

Se o repositório já contiver as migrations iniciais, aplique as pendentes:

```powershell
npx prisma migrate dev
npx prisma generate
```

## 5. Executar a API

Ainda na pasta `apps/api`, execute:

```powershell
npm run dev
```

Para verificar o endpoint de saúde, acesse:

- http://localhost:3000/health

## 6. Executar o aplicativo desktop

Abra um segundo terminal e volte à raiz do repositório. Depois, entre na pasta do desktop:

```powershell
cd .\apps\desktop
```

Instale as dependências:

```powershell
npm ci
```

Inicie o Electron:

```powershell
npm run dev
```

A janela do aplicativo desktop será aberta.

Mantenha o processo da API em execução enquanto testa funcionalidades que dependam do backend.

## 7. Estrutura do projeto

```text
.
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── desktop/
│       ├── src/
│       │   ├── main/
│       │   ├── preload/
│       │   └── renderer/
│       ├── package.json
│       └── ...
│
├── infrastructure/
│   └── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

### Responsabilidades

- `apps/desktop`: aplicativo Electron e interface React.
- `apps/api`: API Express, regras de negócio e integração com o Prisma.
- `apps/api/prisma`: schema e histórico de migrations do banco.
- `infrastructure`: configuração dos serviços locais, como o PostgreSQL.

O desktop se comunica com a API por HTTP/REST. A interface não acessa o banco diretamente.

## 8. Parar o ambiente

Para parar os contêineres sem remover os dados persistidos:

```powershell
docker compose stop
```

Para remover os contêineres e a rede criada pelo Compose, mantendo os volumes nomeados:

```powershell
docker compose down
```

Para voltar a trabalhar, inicie novamente:

```powershell
docker compose up -d
```
