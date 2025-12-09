require("dotenv").config(); // Carrega variáveis de ambiente
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors()); // Permite acesso do Frontend

// --- CONEXÃO COM O BANCO DE DADOS ---
const connectionString = process.env.DATABASE_URL;

// Verificação de segurança para não rodar sem banco
if (!connectionString) {
  console.error("❌ ERRO CRÍTICO: DATABASE_URL não encontrada no arquivo .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Obrigatório para Aiven/Render
});

// =======================================================
// 1. ROTAS DE AUTENTICAÇÃO (LOGIN)
// =======================================================
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;
  console.log("🕵️ Tentativa de Login:", email);

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      // Comparação de senha (com trim para evitar erros de espaço)
      if (String(user.senha).trim() === String(senha).trim()) {
        delete user.senha; // Remove a senha antes de enviar
        return res.json({ sucesso: true, usuario: user });
      }
    }

    res
      .status(401)
      .json({ sucesso: false, mensagem: "E-mail ou senha inválidos." });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

// =======================================================
// 2. ROTAS DE DASHBOARD
// =======================================================
app.get("/api/dashboard", async (req, res) => {
  try {
    // Soma das contas pendentes e vencidas (anteriores a hoje)
    const result = await pool.query(
      "SELECT SUM(valor) as total FROM pagamentos WHERE status = 'Pendente' AND vencimento < CURRENT_DATE"
    );
    res.json({
      resumo: {
        vencidos: Number(result.rows[0].total) || 0,
      },
    });
  } catch (err) {
    console.error("Erro dashboard:", err);
    res.status(500).json({ erro: "Erro ao calcular dashboard" });
  }
});

// =======================================================
// 3. ROTAS DE TRANSAÇÕES (PAGAMENTOS)
// =======================================================

// LISTAR
app.get("/api/transactions", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pagamentos ORDER BY vencimento DESC"
    );

    // Mapeia do formato do Banco (snake_case) para o Frontend (camelCase)
    const formatado = result.rows.map((row) => ({
      id: row.id,
      description: row.descricao,
      amount: Number(row.valor),
      category: row.categoria,
      status: row.status,
      accountType: row.tipo_conta,
      installments: row.parcelas,
      dueDate: row.vencimento,
      date: row.data_pagamento || row.vencimento,
    }));

    res.json(formatado);
  } catch (err) {
    console.error("Erro ao listar transações:", err);
    res.status(500).json({ erro: "Erro ao buscar dados" });
  }
});

// ADICIONAR
app.post("/api/transactions", async (req, res) => {
  const {
    description,
    amount,
    category,
    status,
    accountType,
    installments,
    dueDate,
    date,
  } = req.body;

  console.log("💰 Nova Transação:", description, amount);

  try {
    const query = `
      INSERT INTO pagamentos 
      (descricao, valor, categoria, status, tipo_conta, parcelas, vencimento, data_pagamento, usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      description,
      amount,
      category,
      status,
      accountType,
      installments,
      dueDate,
      date,
      1, // ID fixo do usuário (admin)
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    // Retorna o objeto criado formatado
    res.json({
      id: row.id,
      description: row.descricao,
      amount: Number(row.valor),
      category: row.categoria,
      status: row.status,
      accountType: row.tipo_conta,
      installments: row.parcelas,
      dueDate: row.vencimento,
      date: row.data_pagamento,
    });
  } catch (err) {
    console.error("Erro ao salvar transação:", err);
    res.status(500).json({ erro: "Falha ao salvar no banco de dados" });
  }
});

// EXCLUIR
app.delete("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM pagamentos WHERE id = $1", [id]);
    res.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao excluir:", err);
    res.status(500).json({ erro: "Falha ao excluir registro" });
  }
});

// =======================================================
// 4. ROTAS DE CATEGORIAS (NOVO - INTEGRADO AO BANCO)
// =======================================================

// LISTAR CATEGORIAS
app.get("/api/categories", async (req, res) => {
  try {
    // Busca categorias ordenadas por nome
    const result = await pool.query(
      "SELECT nome FROM categorias ORDER BY nome ASC"
    );

    // Se a tabela estiver vazia, retorna um array padrão para não quebrar o front
    if (result.rows.length === 0) {
      return res.json([
        "Alimentação",
        "Moradia",
        "Transporte",
        "Lazer",
        "Saúde",
      ]);
    }

    // Transforma o array de objetos [{nome: 'A'}, {nome: 'B'}] em array de strings ['A', 'B']
    const lista = result.rows.map((row) => row.nome);
    res.json(lista);
  } catch (err) {
    console.error("Erro categorias:", err);
    // Fallback em caso de erro de banco (ex: tabela não existe)
    res.json(["Alimentação", "Moradia", "Transporte"]);
  }
});

// ADICIONAR CATEGORIA
app.post("/api/categories", async (req, res) => {
  const { category } = req.body;
  try {
    // Tenta inserir (se já existir, vai dar erro, então usamos o catch)
    await pool.query("INSERT INTO categorias (nome) VALUES ($1)", [category]);

    // Retorna a lista completa atualizada
    const result = await pool.query(
      "SELECT nome FROM categorias ORDER BY nome ASC"
    );
    res.json(result.rows.map((r) => r.nome));
  } catch (err) {
    console.error("Erro ao add categoria:", err);
    res
      .status(500)
      .json({ error: "Erro ao adicionar categoria (provavelmente duplicada)" });
  }
});

// REMOVER CATEGORIA
app.delete("/api/categories/:name", async (req, res) => {
  const { name } = req.params;
  try {
    await pool.query("DELETE FROM categorias WHERE nome = $1", [name]);

    // Retorna a lista atualizada
    const result = await pool.query(
      "SELECT nome FROM categorias ORDER BY nome ASC"
    );
    res.json(result.rows.map((r) => r.nome));
  } catch (err) {
    console.error("Erro ao del categoria:", err);
    res.status(500).json({ error: "Erro ao remover categoria" });
  }
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor Full Stack rodando na porta ${PORT}`);
});
