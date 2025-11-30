require("dotenv").config(); // Carrega o .env
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERRO: URL do banco não encontrada no .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function updateTable() {
  try {
    console.log("⏳ Atualizando estrutura do banco...");

    // Apaga a tabela antiga
    await pool.query("DROP TABLE IF EXISTS pagamentos");

    // Cria a tabela nova completa
    await pool.query(`
      CREATE TABLE pagamentos (
        id SERIAL PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
        valor NUMERIC(10, 2) NOT NULL,
        categoria VARCHAR(100),
        status VARCHAR(50),
        tipo_conta VARCHAR(50), 
        parcelas VARCHAR(20),
        vencimento DATE NOT NULL,
        data_pagamento DATE,
        usuario_id INTEGER REFERENCES usuarios(id)
      );
    `);

    console.log("✅ Tabela 'pagamentos' recriada com sucesso!");
  } catch (err) {
    console.error("❌ Erro:", err);
  } finally {
    await pool.end();
  }
}

updateTable();
