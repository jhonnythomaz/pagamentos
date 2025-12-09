require("dotenv").config();
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function update() {
  try {
    console.log("⏳ Criando tabela de categorias...");

    // 1. Cria a tabela se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    // 2. Insere categorias padrão (apenas se a tabela estiver vazia)
    const check = await pool.query("SELECT count(*) FROM categorias");
    if (parseInt(check.rows[0].count) === 0) {
      console.log("📥 Inserindo categorias padrão...");
      await pool.query(`
            INSERT INTO categorias (nome) VALUES 
            ('Alimentação'), ('Moradia'), ('Transporte'), 
            ('Lazer'), ('Saúde'), ('Educação'), 
            ('Salário'), ('Investimentos')
        `);
    }

    console.log("✅ Tabela 'categorias' pronta e populada!");
  } catch (err) {
    console.error("❌ Erro:", err);
  } finally {
    await pool.end();
  }
}

update();
