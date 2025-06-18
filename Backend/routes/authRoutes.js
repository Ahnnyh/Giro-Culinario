const express = require('express');
const router = express.Router();
const path = require('path');
const authController = require('../controllers/authController');
const User = require('../models/User'); // <- IMPORTANTE para buscar o email do usuário

// Definindo o caminho base para os arquivos HTML
const viewsPath = path.join(__dirname, '../../Login e CadastroLogin');

// Rotas para páginas HTML
router.get('/login', (req, res) => {
  res.sendFile(path.join(viewsPath, 'Login.html'));
});

router.get('/cadastro', (req, res) => {
  res.sendFile(path.join(viewsPath, 'CadastroLogin.html'));
});

router.get('/logout', authController.logout);

// Rotas de processamento de autenticação
router.post('/login', authController.postLogin);
router.post('/cadastro', authController.postCadastro);
router.get('/logout', authController.logout);
// Middleware para proteger as rotas abaixo
router.use(authController.isAuthenticated);
// Nova rota para atualizar dados
router.put('/atualizar-dados', authController.atualizarDados);
// Nova rota para alterar senha
router.post('/alterar-senha', authController.alterarSenha);

//ROTA: retornar dados do usuário logado
router.get('/usuario', async (req, res) => {
  if (req.session.userId && req.session.userNome) {
    try {
      const usuario = await User.findByPk(req.session.userId);
      res.json({
        logado: true,
        id: usuario?.id, // ESSENCIAL
        nome: req.session.userNome,
        email: usuario?.email || ''
      });
    } catch (err) {
      console.error('Erro ao buscar dados do usuário:', err);
      res.status(500).json({ logado: false });
    }
  } else {
    res.json({ logado: false });
  }
});

module.exports = router;
