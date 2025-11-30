// server.cjs
require("dotenv").config(); // CARREGA O ARQUIVO .ENV
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(cors());

// --- CONEXÃO COM O BANCO ---
// Agora a senha vem do arquivo .env para o GitHub não bloquear
const connectionString = process.env.DATABASE_URL;

// Verificação de segurança
if (!connectionString) {
  console.error("❌ ERRO: A variável DATABASE_URL não foi encontrada.");
  console.error(
    "👉 Certifique-se de ter criado o arquivo .env na raiz do projeto com a URL do banco."
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// --- ROTA DE LOGIN ---
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  console.log("🕵️ Tentativa de Login:", email);

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      // Comparação simples (para produção use bcrypt)
      if (String(user.senha).trim() === String(senha).trim()) {
        delete user.senha;
        return res.json({ sucesso: true, usuario: user });
      }
    }
    res.status(401).json({ sucesso: false, mensagem: "Credenciais inválidas" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

// --- ROTA DE DASHBOARD ---
app.get("/api/dashboard", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT SUM(valor) as total FROM pagamentos WHERE status = 'Pendente' AND vencimento < CURRENT_DATE"
    );
    res.json({ resumo: { vencidos: result.rows[0].total || 0 } });
  } catch (err) {
    res.status(500).json({ erro: "Erro dashboard" });
  }
});

// =======================================================
// ROTAS DE PAGAMENTOS (CRUD)
// =======================================================

// 1. LISTAR TODAS AS TRANSAÇÕES
app.get("/api/transactions", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pagamentos ORDER BY vencimento DESC"
    );

    // Converte snake_case (banco) para camelCase (frontend)
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
    console.error(err);
    res.status(500).json({ erro: "Erro ao listar" });
  }
});

// 2. ADICIONAR NOVA TRANSAÇÃO
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

  console.log("💰 Novo Pagamento:", description, amount);

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
      1, // ID do usuário fixo (admin)
    ];

    const result = await pool.query(query, values);

    const row = result.rows[0];
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
    console.error("Erro ao salvar:", err);
    res.status(500).json({ erro: "Erro ao salvar pagamento" });
  }
});

// 3. EXCLUIR TRANSAÇÃO
app.delete("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM pagamentos WHERE id = $1", [id]);
    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao excluir" });
  }
});

// --- INICIAR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor Full Stack rodando na porta ${PORT}`);
});
