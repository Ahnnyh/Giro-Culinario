const Receita = require('../models/Receita');

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
  }
};
