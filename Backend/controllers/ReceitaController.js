const Receita = require('../models/Receita');
const imagekit = require('../config/imagekit');

const CATEGORIAS_VALIDAS = ['Brasileira', 'Italiana', 'Mediterranea', 'Oriental'];

function slugify(texto) {
  return texto
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function gerarIdUnico(nome) {
  const base = slugify(nome);
  let id = base;
  let contador = 2;

  while (await Receita.findByPk(id)) {
    id = `${base}-${contador}`;
    contador++;
  }

  return id;
}

async function uploadParaImageKit(file, subpasta) {
  const resultado = await imagekit.upload({
    file: file.buffer,
    fileName: file.originalname,
    folder: `/giro-culinario/${subpasta}`
  });
  return resultado.url;
}

module.exports = {
  // GET /api/receitas ou /api/receitas?categoria=Brasileira
  async listar(req, res) {
    try {
      const where = req.query.categoria ? { categoria: req.query.categoria } : {};
      const receitas = await Receita.findAll({
        where,
        attributes: ['id', 'nome', 'categoria', 'imagem', 'tempo', 'porcoes'],
        order: [['nome', 'ASC']]
      });
      res.json(receitas);
    } catch (err) {
      console.error('Erro ao listar receitas:', err);
      res.status(500).json({ message: 'Erro ao listar receitas' });
    }
  },

  // GET /api/receitas/destaques
  async listarDestaques(req, res) {
    try {
      const receitas = await Receita.findAll({
        where: { destaque: true },
        attributes: ['id', 'nome', 'categoria', 'imagem', 'tempo', 'porcoes']
      });
      res.json(receitas);
    } catch (err) {
      console.error('Erro ao listar destaques:', err);
      res.status(500).json({ message: 'Erro ao listar destaques' });
    }
  },

  // GET /api/receitas/:id
  async buscarPorId(req, res) {
    try {
      const receita = await Receita.findByPk(req.params.id);
      if (!receita) {
        return res.status(404).json({ message: 'Receita não encontrada' });
      }
      res.json(receita);
    } catch (err) {
      console.error('Erro ao buscar receita:', err);
      res.status(500).json({ message: 'Erro ao buscar receita' });
    }
  },

  // POST /api/receitas (usuário logado)
  async criar(req, res) {
    try {
      const { nome, categoria, tempo, porcoes } = req.body;
      let { ingredientes, preparo } = req.body;

      if (!nome || !nome.trim()) {
        return res.status(400).json({ message: 'Informe o nome da receita.' });
      }
      if (!CATEGORIAS_VALIDAS.includes(categoria)) {
        return res.status(400).json({ message: 'Categoria inválida.' });
      }

      // ingredientes/preparo chegam como JSON (array de strings) dentro do multipart/form-data
      try {
        ingredientes = JSON.parse(ingredientes || '[]').map(i => i.trim()).filter(Boolean);
        preparo = JSON.parse(preparo || '[]').map(p => p.trim()).filter(Boolean);
      } catch {
        return res.status(400).json({ message: 'Ingredientes ou modo de preparo em formato inválido.' });
      }

      if (!ingredientes.length) {
        return res.status(400).json({ message: 'Adicione ao menos um ingrediente.' });
      }
      if (!preparo.length) {
        return res.status(400).json({ message: 'Adicione ao menos um passo do modo de preparo.' });
      }

      const arquivoImagem = req.files?.imagemPrincipal?.[0];
      if (!arquivoImagem) {
        return res.status(400).json({ message: 'Envie uma imagem principal para a receita.' });
      }

      if (!imagekit) {
        return res.status(503).json({ message: 'Upload de imagens indisponível no momento. Tente novamente mais tarde.' });
      }

      const id = await gerarIdUnico(nome.trim());
      const imagem = await uploadParaImageKit(arquivoImagem, 'receitas');

      let midiaPreparo = null;
      let tipoMidiaPreparo = null;
      const arquivoMidia = req.files?.midiaPreparo?.[0];
      if (arquivoMidia) {
        midiaPreparo = await uploadParaImageKit(arquivoMidia, 'preparo');
        tipoMidiaPreparo = arquivoMidia.mimetype.startsWith('video/') ? 'video' : 'gif';
      }

      const receita = await Receita.create({
        id,
        nome: nome.trim(),
        categoria,
        imagem,
        midiaPreparo,
        tipoMidiaPreparo,
        tempo: tempo?.trim() || null,
        porcoes: porcoes?.trim() || null,
        ingredientes,
        preparo,
        destaque: false,
        criadoPor: req.session.userId
      });

      res.status(201).json(receita);
    } catch (err) {
      console.error('Erro ao criar receita:', err);
      res.status(500).json({ message: 'Erro ao criar receita' });
    }
  }
};
