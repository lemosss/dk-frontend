# dk-frontend

Front-end Single Page Application (SPA) em Vue 3 + Vite + TypeScript para o projeto DK. Esta aplicação substitui os templates Jinja2 usados anteriormente e consome a API do backend em `dk-api`.

## Visão geral

- Framework: Vue 3
- Bundler/dev server: Vite
- Linguagem: TypeScript
- Estado: Pinia
- Cliente HTTP: Axios

Por padrão a aplicação aponta para a API em `http://127.0.0.1:8000/api/v1`. A configuração está em `src/services/api.ts`.

## Requisitos

- Node.js 16+ (ou versão compatível com dependências do projeto)
- npm ou yarn/pnpm

## Instalando dependências

Usando npm:

```bash
npm install
```

Usando yarn:

```bash
yarn
```

## Executando em desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

O Vite por padrão abre em `http://localhost:5173`.

## Build para produção

```bash
npm run build
# ou
yarn build
```

Para servir o build localmente (preview):

```bash
npm run preview
# ou
yarn preview
```

## Variáveis de ambiente

Crie arquivos `.env` ou `.env.local` na raiz do projeto para sobrescrever valores. Variáveis úteis:

```env
# URL base da API usada pelo frontend
VITE_API_URL=http://127.0.0.1:8000/api/v1

# Porta do Vite (opcional)
VITE_PORT=5173
```

OBS: se você alterar a `VITE_API_URL`, reinicie o servidor de desenvolvimento.

## Estrutura principal do projeto

- `src/` - código-fonte
	- `main.ts` - bootstrap da app
	- `App.vue` - componente raiz
	- `components/` - componentes reutilizáveis (ex.: `Sidebar`, `Toast`)
	- `views/` - páginas/rotas (ex.: `CompaniesView`, `InvoicesView`, `CalendarView`)
	- `stores/` - stores Pinia (`auth`, `toast`, etc.)
	- `services/` - cliente Axios e serviços para chamadas à API
	- `types/` - tipos TypeScript compartilhados

## Integração com backend

O cliente Axios está configurado em `src/services/api.ts`. Se o backend estiver rodando localmente, a API padrão é `http://127.0.0.1:8000/api/v1`.

Autenticação: o fluxo de login armazena token JWT em `localStorage` e o interceptor do Axios injeta o header `Authorization: Bearer <token>` nas requisições.

Se você encontrar erros 401, verifique:

- `localStorage` contém o token correto
- A `baseURL` em `src/services/api.ts` está apontando para a URL correta do backend

## Notificações (toasts)

O projeto usa uma store Pinia para exibir toasts (`src/stores/toast.ts`) e um componente `Toast.vue` que fica montado em `App.vue`.

## Linters, formatadores e testes

Se houver configurações de lint/format no projeto (ESLint, Prettier), use os scripts correspondentes no `package.json`:

```bash
npm run lint
npm run format
```

Se houver testes configurados, rode:

```bash
npm run test
```

## Dicas de desenvolvimento

- Ao debugar chamadas HTTP, abra o devtools do navegador para inspecionar headers e payloads.
- Para problemas de CORS, verifique configurações no backend (FastAPI) e se o erro ocorre antes do middleware de CORS (erros 500 podem impedir envio de headers CORS).
- Caso o Vite esteja sendo usado com proxy (não recomendado neste projeto), certifique-se de encaminhar headers de `Authorization` corretamente.

## Contribuindo

1. Abra uma issue descrevendo a alteração.
2. Crie um branch com um nome descritivo: `feature/minha-coisa` ou `fix/bug-descricao`.
3. Faça commits pequenos e claros.
4. Abra um Pull Request apontando para `develop`.

## Arquivos importantes

- `src/services/api.ts` — configuração do Axios e `baseURL`.
- `src/stores/auth.ts` — login, logout e gerenciamento do token.
- `src/stores/toast.ts` — gerenciamento global de toasts.
- `src/views/CompaniesView.vue` — CRUD de empresas (inclui chamadas que podem retornar erros de integridade).

## Exemplo rápido: mudar a URL da API

Edite ou crie `.env.local` com:

```env
VITE_API_URL=http://seu-backend:8000/api/v1
```

Reinicie o servidor de desenvolvimento.

## Suporte

Se precisar que eu adapte este `README.md` (ex.: adicionar seções de `docker`, `CI`, `how-to-run-e2e`), me fale o que deseja e eu atualizo.

---

_README gerado/atualizado em Português (pt-BR)._ 
