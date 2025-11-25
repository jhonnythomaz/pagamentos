# 💰 Organizador de Pagamentos (FinanDash)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

Uma aplicação web completa para **Gestão Financeira Pessoal**, focada no controle de contas a pagar, orçamentos mensais e visualização de despesas. O projeto é construído com **React**, **TypeScript** e estilizado com **Tailwind CSS**, oferecendo uma interface moderna, responsiva e com suporte a tema escuro (Dark Mode).

---

## ✨ Funcionalidades Principais

### 📊 Dashboard Inteligente
- **Visão Geral:** Cards com totais pagos, a vencer e vencidos no mês.
- **Meta de Gastos (Budget):** Barra de progresso visual para acompanhar o consumo do orçamento mensal definido.
- **Alertas:** Indicadores visuais para contas vencidas ou vencendo hoje.
- **Gráfico Histórico:** Visualização de despesas dos últimos 6 meses.

### 💸 Gestão de Transações
- **CRUD Completo:** Adicionar, editar e excluir pagamentos.
- **Parcelamento Automático:** Ao cadastrar uma compra parcelada (ex: 10x), o sistema oferece a opção de gerar automaticamente todos os lançamentos futuros com as datas corretas.
- **Filtros Avançados:** Pesquisa por texto, status, tipo de conta e categoria.
- **Exportação:** Exportação dos dados filtrados para **CSV**.

### 📅 Calendário e Prazos
- **Visualização Mensal:** Calendário interativo mostrando os vencimentos de cada dia.
- **Status por Cor:** Identificação rápida de contas pagas (cinza), pendentes (amarelo) e atrasadas (vermelho).
- **Lista de "A Vencer":** View dedicada para contas pendentes ordenadas por urgência.

### ⚙️ Configurações e Personalização
- **Categorias Dinâmicas:** Crie e remova categorias personalizadas para organizar suas finanças.
- **Dark Mode:** Tema escuro completo para conforto visual, persistido nas preferências do usuário.
- **Responsividade:** Sidebar adaptável para dispositivos móveis e desktop.

---

## 🚀 Tecnologias Utilizadas

- **Core:** React 18, TypeScript
- **Build Tool:** Vite
- **Estilização:** Tailwind CSS
- **Gráficos:** Recharts
- **Ícones:** SVG Personalizados (Componentes React)
- **Persistência:** LocalStorage (Os dados ficam salvos no navegador do usuário)

---

## 📦 Como Rodar o Projeto

Pré-requisitos: Certifique-se de ter o **Node.js** instalado.

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/organizador-pagamentos.git
   cd organizador-pagamentos
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   O terminal exibirá o link, geralmente `http://localhost:5173`.

---

## 🖼️ Estrutura do Projeto

```
src/
├── components/       # Componentes de UI (Views, Modais, Cards)
│   ├── Dashboard.tsx
│   ├── TransactionModal.tsx
│   ├── ...
├── services/         # Lógica de API e Notificações
│   ├── api.ts        # Simulação de backend com LocalStorage
│   └── notificationService.ts
├── App.tsx           # Componente Raiz e Roteamento
├── types.ts          # Definições de Tipos TypeScript
└── main.tsx          # Ponto de entrada
```

---

## 💡 Dicas de Uso

1. **Primeiro Acesso:** O sistema carrega alguns dados de exemplo automaticamente. Você pode excluí-los e começar do zero.
2. **Defina seu Orçamento:** Vá em "Configurações" e defina sua meta de gastos mensal para ativar a barra de progresso no Dashboard.
3. **Parcelas:** Ao adicionar uma conta "Não Recorrente" com parcelas (ex: Total 3), marque a caixa "Gerar automaticamente..." para criar os lançamentos dos meses seguintes de uma só vez.

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para usar e modificar.
