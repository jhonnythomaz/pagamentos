require("dotenv").config(); // <--- IMPORTANTE: Carrega o .env
const { Pool } = require("pg");

console.log("⏳ Iniciando o script de banco de dados...");

// AGORA A SENHA VEM DO ARQUIVO SECRETO
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERRO: Não encontrei a URL do banco.");
  console.error(
    "👉 Verifique se o arquivo .env existe com a variável DATABASE_URL."
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function setup() {
  try {
    console.log("🔌 Tentando conectar ao Aiven...");

    // Teste de conexão simples
    const res = await pool.query("SELECT NOW()");
    console.log(
      "✅ Conectado com sucesso! Hora no servidor: " + res.rows[0].now
    );

    // 1. Criar Tabela de Usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        nome VARCHAR(255)
      );
    `);
    console.log("✅ Tabela 'usuarios' ok.");

    // 2. Criar Tabela de Pagamentos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pagamentos (
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
    console.log("✅ Tabela 'pagamentos' ok.");

    // 3. Criar usuário de teste
    const userCheck = await pool.query(
      "SELECT * FROM usuarios WHERE email = 'admin@alecrim.com'"
    );
    if (userCheck.rows.length === 0) {
      await pool.query(`
        INSERT INTO usuarios (email, senha, nome) 
        VALUES ('admin@alecrim.com', '123', 'Admin Alecrim')
      `);
      console.log("👤 Usuário admin criado.");
    }

    // 4. Criar pagamentos de teste (Se vazio)
    const payCheck = await pool.query("SELECT * FROM pagamentos");
    if (payCheck.rows.length === 0) {
      await pool.query(`
        INSERT INTO pagamentos (descricao, valor, categoria, status, tipo_conta, vencimento, usuario_id) VALUES 
        ('Conta de Luz', 150.00, 'Moradia', 'pendente', 'Variável', '2023-12-10', 1),
        ('Internet', 99.90, 'Moradia', 'pago', 'Recorrente', '2023-12-15', 1)
      `);
      console.log("💰 Dados de exemplo inseridos.");
    }

    console.log("🚀 SUCESSO! Banco configurado.");
  } catch (err) {
    console.error("❌ ERRO:", err);
  } finally {
    await pool.end();
  }
}

setup();
