
<div align="center">
	<h1>🌿 Alecrim Dourado — Organizador de Pagamentos</h1>
	<p><em>Aplicação web para controlar contas, pagamentos, categorias e relatórios financeiros.</em></p>
</div>

Resumo: projeto front-end criado com React + Vite em TypeScript. Fornece telas para visualizar contas a vencer, vencidas, pagas, gráficos de despesas (Recharts) e gerenciamento básico de transações.

---

## Índice

- Sobre
- Recursos
- Tecnologias
- Pré-requisitos
- Instalação rápida
- Scripts disponíveis
- Variáveis de ambiente
- Configurações importantes
- Estrutura do projeto
- Deploy (GitHub Pages)
- Dicas de desenvolvimento
- Problemas comuns / Troubleshooting
- Contribuição
- Licença

---

## Sobre

Nome: Alecrim Dourado — Organizador de Pagamentos

Descrição: Uma aplicação de gerenciamento financeiro focada no controle de pagamentos e despesas. (Ver `metadata.json` para metadados do projeto.)

## Recursos

- Visualizar contas por status (a vencer, vencido, pago)
- Cadastro/edição de transações (modal de transação)
- Dashboard com gráficos usando Recharts
- Visualização por calendário
- Relatórios básicos de despesas
- Notificações (componente `Toast`)

## Tecnologias

- React 18
- Vite (build/dev server)
- TypeScript
- TailwindCSS + PostCSS
- Recharts (gráficos)
- gh-pages (deploy para GitHub Pages)

Versões (conforme `package.json`):

- react ^18.2.0
- react-dom ^18.2.0
- recharts ^2.12.7
- vite ^5.2.0
- typescript ^5.2.2
- tailwindcss ^3.4.3

## Pré-requisitos

- Node.js (recomendado >= 16)
- npm (ou pnpm/yarn — comandos documentados usam npm)

Recomendo usar o Node Version Manager (nvm) para gerenciar versões de Node se tiver múltiplos projetos.

## Instalação rápida

No diretório do projeto (`pagamentos`):

```powershell
npm install
```

Depois, iniciar em modo desenvolvimento:

```powershell
npm run dev
```

Abra http://localhost:5173 (ou a porta indicada no terminal) no navegador.

## Scripts disponíveis

Todos os scripts vêm de `package.json` e podem ser usados conforme abaixo:

- `npm run dev` — inicia o servidor de desenvolvimento com Vite.
- `npm run build` — gera os arquivos de produção em `dist`.
- `npm run preview` — serve o build de produção localmente (útil para checar o build antes do deploy).
- `npm run lint` — checagem de tipos via `tsc --noEmit`.
- `npm run deploy` — publica `dist` usando `gh-pages`. Existe também `predeploy` que roda `npm run build` automaticamente.

Exemplos (PowerShell):

```powershell
# desenvolvimento
npm run dev

# build e verificação
npm run build
npm run preview

# publicar (GitHub Pages)

```

## Configurações importantes

- `vite.config.ts` define `base: '/pagamentos/'`. Isso é importante se você for publicar o site em GitHub Pages sob `https://<usuario>.github.io/pagamentos/`. Se for publicar em outro caminho ou domínio (ex.: raiz do domínio), ajuste `base` ou remova-o.
- `tailwind.config.js` e `postcss.config.js` controlam estilos; o projeto já inclui essas dependências.

## Estrutura do projeto (resumida)

- `index.html` — documento principal
- `index.tsx` / `App.tsx` — ponto de entrada React
- `components/` — componentes e views (Dashboard, TransactionsView, CalendarView, Toast, TransactionModal etc.)
- `services/` — `api.ts`, `notificationService.ts`
- `styles` / `index.css` — tailwind / estilos globais
- `vite.config.ts`, `tsconfig.json`, `package.json` — configurações do projeto

Lista de arquivos relevantes:

- `components/AccountsDueView.tsx`
- `components/CalendarView.tsx`
- `components/Dashboard.tsx`
- `components/TransactionsView.tsx`
- `components/TransactionModal.tsx`
- `services/api.ts`
- `services/notificationService.ts`

## Deploy (GitHub Pages)

O projeto está preparado para publicar no GitHub Pages usando `gh-pages`.

Passos:

```powershell
npm run build
npm run deploy
```

Observações e dicas:

- `vite.config.ts` com `base: '/pagamentos/'` faz com que os arquivos sejam referenciados com esse prefixo. Ajuste se seu repositório tiver outro nome ou se usar um domínio customizado.
- O comando `npm run deploy` executa `gh-pages -d dist` (veja `package.json`). O pacote `gh-pages` cria/atualiza a branch `gh-pages` automaticamente.
- Se quiser publicar na raiz do domínio (`https://username.github.io/`), altere `base` para `'/'` e atualize os links conforme necessário.

## Dicas de desenvolvimento

- Rodar `npm run lint` antes de abrir um PR para garantir que não haja erros de digitação TypeScript.
- Use o modo strict do TypeScript durante o desenvolvimento para capturar problemas cedo.
- VSCode: instalar extensões recomendadas — ESLint, Prettier, Tailwind CSS IntelliSense, TypeScript React.

## Problemas comuns / Troubleshooting

- Erro de assets 404 após deploy:
	- Verifique o `base` em `vite.config.ts` e confirme o caminho do GitHub Pages.
	- Se usar um domínio customizado, confirme a configuração do DNS e o arquivo `CNAME` (se necessário).

- Porta ocupada ao rodar `npm run dev`:
	- Mude a porta via `vite` CLI: `vite --port 3000` ou configure no `vite.config.ts`.