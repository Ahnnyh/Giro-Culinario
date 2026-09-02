require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Necessário quando a aplicação roda atrás de um proxy (Render, Railway, etc.)
// para que cookies "secure" funcionem corretamente com HTTPS.
if (isProduction) {
  app.set('trust proxy', 1);
}

// Configuração do banco de dados
const { sequelize } = require('./config/database');

require('./models/User');
require('./models/Comentario');
require('./models/Receita');

// Sessão com Sequelize
const sessionStore = new SequelizeStore({
  db: sequelize,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000
});

sessionStore.sync();

app.use(session({
  secret: process.env.SESSION_SECRET || 'giro-culinario-dev-secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Middlewares padrão
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Caminhos de arquivos estáticos
const projectRoot = path.join(__dirname, '..');
app.use(express.static(projectRoot));
app.use('/CSS', express.static(path.join(projectRoot, 'CSS')));
app.use('/JavaScript', express.static(path.join(projectRoot, 'JavaScript')));
app.use('/IMG', express.static(path.join(projectRoot, 'IMG')));
app.use('/PaginaCulinarias', express.static(path.join(projectRoot, 'PaginaCulinarias')));
app.use('/TodasReceitas', express.static(path.join(projectRoot, 'TodasReceitas')));
app.use('/css', express.static(path.join(projectRoot, 'css')));
app.use('/Javascript', express.static(path.join(projectRoot, 'Javascript')));

// Caminho das páginas de login/cadastro
const loginPath = path.join(__dirname, '../Login e CadastroLogin');

// Rotas HTML
app.get('/login', (req, res) => {
  res.sendFile(path.join(loginPath, 'Login.html'));
});

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(loginPath, 'CadastroLogin.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(projectRoot, 'TodasReceitas', 'Home.html'));
});

// Rota da página de receita (dinâmica: o conteúdo é buscado da API pelo id na URL)
app.get('/receita/:id', (req, res) => {
  res.sendFile(path.join(projectRoot, 'TodasReceitas', 'receita.html'));
});

// Rotas da aplicação
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const ComentarioRoutes = require('./routes/ComentarioRoutes');
const favoritoRoutes = require('./routes/FavoritoRoutes');
const receitaRoutes = require('./routes/receitaRoutes');

app.use('/api/auth', authRoutes);
app.use('/', homeRoutes);
app.use('/api/comentarios', ComentarioRoutes);
app.use('/api/favoritos', favoritoRoutes);
app.use('/api/receitas', receitaRoutes);

// Sincronizar banco e iniciar servidor
sequelize.sync({ alter: false })
  .then(() => {
    app.listen(PORT, () => {
      const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
      console.log(`\nServidor rodando na porta ${PORT}`);
      console.log(`Acesse:`);
      console.log(`- Login: ${baseUrl}/login`);
      console.log(`- Cadastro: ${baseUrl}/cadastro`);
      console.log(`- Home: ${baseUrl}`);
      console.log(`- API Receitas: ${baseUrl}/api/receitas\n`);
    });
  })
  .catch(err => {
    console.error('Erro ao sincronizar banco de dados:', err);
    process.exit(1);
  });
