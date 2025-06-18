const User = require('../models/User');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const authController = {

  // Processar login
  postLogin: async (req, res) => {
    const { email, senha } = req.body;
console.log('Tentando login com:', req.body);

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
      }

      const senhaValida = await user.validarSenha(senha);

      if (!senhaValida) {
        return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
      }

      // Criar sessão
      req.session.userId = user.id;
      req.session.userNome = user.nome;

      res.json({ success: true, redirect: '/home' });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  },

  // Processar cadastro
  postCadastro: async (req, res) => {
  const { nome, email, senha } = req.body;

  console.log('Dados recebidos no cadastro:', { nome, email, senha });

  if (!nome || !email || !senha) {
    console.log('❌ Campos vazios');
    return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
  }

  try {
    const usuarioExistente = await User.findOne({ where: { email } });

    if (usuarioExistente) {
      console.log('❌ Email já cadastrado');
      return res.status(400).json({ success: false, message: 'Email já cadastrado.' });
    }

    console.log('✅ Criando usuário...');

    // 🔒 Criptografar senha antes de salvar
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = await User.create({
      nome,
      email,
      senha: senhaCriptografada
    });

    console.log('✅ Usuário criado com sucesso:', novoUsuario.toJSON());

    req.session.userId = novoUsuario.id;
    req.session.userNome = novoUsuario.nome;

    res.json({ success: true, redirect: '/home' });

  } catch (error) {
    console.error('🔥 Erro no cadastro:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: 'Dados inválidos. Verifique os campos.' });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'E-mail já cadastrado.' });
    }

    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
},

  
// Atualizar nome e email do usuário logado
  atualizarDados: async (req, res) => {
    try {
      const usuarioId = req.session.userId;
      const { nome, email } = req.body;

      if (!nome || !email) {
        return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
      }

      // Verifica se email já está em uso por outro usuário
      const emailExistente = await User.findOne({ where: { email } });
      if (emailExistente && emailExistente.id !== usuarioId) {
        return res.status(400).json({ success: false, message: 'Email já está em uso.' });
      }

      // Atualiza no banco
      await User.update({ nome, email }, { where: { id: usuarioId } });

      // Atualiza o nome na sessão para refletir no front
      req.session.userNome = nome;

      res.json({ success: true, message: 'Dados atualizados com sucesso.' });

    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }
  },

  // Alterar senha do usuário logado
  alterarSenha: async (req, res) => {
    try {
      const usuarioId = req.session.userId;
      const { senhaAtual, novaSenha } = req.body;

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
      }

      // Busca o usuário
      const usuario = await User.findByPk(usuarioId);

      // Verifica senha atual
      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
      if (!senhaValida) {
        return res.status(400).json({ success: false, message: 'Senha atual incorreta.' });
      }

      // Hash da nova senha
      const hashNovaSenha = await bcrypt.hash(novaSenha, 10);

      // Atualiza no banco
      await User.update({ senha: hashNovaSenha }, { where: { id: usuarioId } });

      res.json({ success: true, message: 'Senha alterada com sucesso.' });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }
  },


  // Logout
  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Erro ao fazer logout');
      }
      res.redirect('/login');
    });
  },

  // Verificar autenticação (middleware)
isAuthenticated: (req, res, next) => {
  if (req.session.userId) {
    return next();
  }

  // Se for chamada da API, responde com JSON em vez de redirecionar
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({ success: false, message: 'Não autenticado.' });
  }
    res.redirect('/login');
  }
};




module.exports = authController;