require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(express.json());
app.use(cors());

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERRO CRÍTICO: DATABASE_URL não encontrada.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// --- AUTO-SETUP: TABELAS ---
pool
  .query(
    `
  CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL
  );
`
  )
  .then(async () => {
    console.log("✅ Tabela de categorias verificada.");
    const check = await pool.query("SELECT count(*) FROM categorias");
    if (parseInt(check.rows[0].count) === 0) {
      await pool.query(
        `INSERT INTO categorias (nome) VALUES ('Alimentação'), ('Moradia'), ('Lazer'), ('Saúde'), ('Salário')`
      );
    }
  })
  .catch((err) => console.error(err));

// =======================================================
// ROTAS API
// =======================================================

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (String(user.senha).trim() === String(senha).trim()) {
        delete user.senha;
        return res.json({ sucesso: true, usuario: user });
      }
    }
    res
      .status(401)
      .json({ sucesso: false, mensagem: "Credenciais inválidas." });
  } catch (err) {
    res.status(500).json({ erro: "Erro servidor" });
  }
});

// DASHBOARD
app.get("/api/dashboard", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT SUM(valor) as total FROM pagamentos WHERE status = 'Pendente' AND vencimento < CURRENT_DATE"
    );
    res.json({ resumo: { vencidos: Number(result.rows[0].total) || 0 } });
  } catch (err) {
    res.status(500).json({ erro: "Erro dashboard" });
  }
});

// --- TRANSAÇÕES ---

// LISTAR
app.get("/api/transactions", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pagamentos ORDER BY vencimento DESC"
    );
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
    res.status(500).json({ erro: "Erro ao listar" });
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
  try {
    const query = `
      INSERT INTO pagamentos (descricao, valor, categoria, status, tipo_conta, parcelas, vencimento, data_pagamento, usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
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
      1,
    ];
    const result = await pool.query(query, values);

    // Formata o retorno para o front
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
    console.error(err);
    res.status(500).json({ erro: "Erro ao salvar" });
  }
});

// [NOVO] ATUALIZAR (PUT)
app.put("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
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

  try {
    const query = `
      UPDATE pagamentos 
      SET descricao = $1, valor = $2, categoria = $3, status = $4, tipo_conta = $5, parcelas = $6, vencimento = $7, data_pagamento = $8
      WHERE id = $9
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
      id,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Não encontrado" });

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
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar" });
  }
});

// EXCLUIR
app.delete("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM pagamentos WHERE id = $1", [id]);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao excluir" });
  }
});

// --- CATEGORIAS ---

app.get("/api/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT nome FROM categorias ORDER BY nome ASC"
    );
    if (result.rows.length === 0) return res.json(["Alimentação", "Moradia"]);
    res.json(result.rows.map((row) => row.nome));
  } catch (err) {
    res.json(["Alimentação", "Moradia"]);
  }
});

app.post("/api/categories", async (req, res) => {
  const { category } = req.body;
  try {
    await pool.query("INSERT INTO categorias (nome) VALUES ($1)", [category]);
    const result = await pool.query(
      "SELECT nome FROM categorias ORDER BY nome ASC"
    );
    res.json(result.rows.map((r) => r.nome));
  } catch (err) {
    res.status(500).json({ error: "Erro ao adicionar categoria" });
  }
});

app.delete("/api/categories/:name", async (req, res) => {
  const { name } = req.params;
  try {
    await pool.query("DELETE FROM categorias WHERE nome = $1", [name]);
    const result = await pool.query(
      "SELECT nome FROM categorias ORDER BY nome ASC"
    );
    res.json(result.rows.map((r) => r.nome));
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover categoria" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
