/**
 * Lê scripts/receitas-seed.json e insere (ou atualiza) cada receita
 * na tabela Receitas do banco configurado em Backend/config/database.js
 * (SQLite localmente, Postgres em produção via DATABASE_URL).
 *
 * Uso:
 *   node scripts/seed-receitas.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../Backend/config/database');
const Receita = require('../Backend/models/Receita');

const SEED_PATH = path.join(__dirname, 'receitas-seed.json');

async function seed() {
  if (!fs.existsSync(SEED_PATH)) {
    console.error('❌ scripts/receitas-seed.json não encontrado. Rode antes: node scripts/extract-recipes-from-html.js');
    process.exit(1);
  }

  const receitas = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));

  await sequelize.authenticate();
  await Receita.sync(); // cria a tabela se ainda não existir

  let criadas = 0, atualizadas = 0;

  for (const receita of receitas) {
    const [, criado] = await Receita.upsert(receita, { returning: true });
    if (criado) criadas++; else atualizadas++;
    console.log(`✅ ${receita.nome}`);
  }

  console.log(`\nConcluído: ${criadas} criada(s), ${atualizadas} atualizada(s). Total: ${receitas.length}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Erro ao popular o banco:', err);
  process.exit(1);
});
