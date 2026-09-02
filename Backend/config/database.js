const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DATABASE_URL) {
  // Produção: banco Postgres hospedado (Render, Supabase, Neon, etc.)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Desenvolvimento local: SQLite, sem precisar configurar nada além do npm install
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false
  });
}

// Testar conexão
sequelize.authenticate()
  .then(() => console.log(`Conexão com o banco de dados (${sequelize.getDialect()}) estabelecida com sucesso.`))
  .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

module.exports = { sequelize };
