const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do banco de dados
const { sequelize } = require('./config/database');

require('./models/User');
require('./models/Comentario');

// Sessão com Sequelize
const sessionStore = new SequelizeStore({
  db: sequelize,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000
});

sessionStore.sync();

app.use(session({
  secret: 'seu_segredo_aqui',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
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

// Servir o receitas.json do backend
app.get('/receitas.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'receitas.json'));
});

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

app.get('/favoritos', (req, res) => {
  res.sendFile(path.join(projectRoot, 'Favoritos.html'));
});

// Rota dinâmica para receitas
app.get('/TodasReceitas/:culinaria/:receita', (req, res) => {
  const culinaria = req.params.culinaria.replace(/\s+/g, '_').toLowerCase();
  let receita = req.params.receita.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').toLowerCase();

  const filePath = path.join(
    projectRoot,
    'TodasReceitas',
    culinaria,
    receita + '.html'
  );

  console.log(`Tentando acessar: ${filePath}`);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Erro ao encontrar arquivo:', {
        culinaria: req.params.culinaria,
        receita: req.params.receita,
        pathTentado: filePath,
        erro: err
      });
      return res.status(404).send('Receita não encontrada');
    }

    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Erro ao enviar arquivo:', err);
        return res.status(500).send('Erro ao carregar receita');
      }
    });
  });
});

// API de receitas
const receitas = require('./receitas.json');
app.get('/v1/receitas', (req, res) => {
  res.json(receitas);
});

// Rotas da aplicação
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const ComentarioRoutes = require('./routes/ComentarioRoutes');
const favoritoRoutes = require('./routes/FavoritoRoutes');

app.use('/api/auth', authRoutes);
app.use('/', homeRoutes);
app.use('/api/comentarios', ComentarioRoutes);
app.use('/api/favoritos', favoritoRoutes);

// Sincronizar banco e iniciar servidor
sequelize.sync({ alter: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\nServidor rodando na porta ${PORT}`);
      console.log(`Acesse:`);
      console.log(`- Login: http://localhost:${PORT}/login`);
      console.log(`- Cadastro: http://localhost:${PORT}/cadastro`);
      console.log(`- Home: http://localhost:${PORT}`);
      console.log(`- Favoritos: http://localhost:${PORT}/favoritos`);
      console.log(`- API Receitas: http://localhost:${PORT}/v1/receitas\n`);
    });
  })
  .catch(err => {
    console.error('Erro ao sincronizar banco de dados:', err);
    process.exit(1);
  });
