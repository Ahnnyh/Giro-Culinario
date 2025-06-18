const Comentario = require('../models/Comentario');
const User = require('../models/User');

const ComentarioController = {
  async criar(req, res) {
    const { texto, estrelas, receitaId } = req.body;
    const userId = req.session.userId;

    if (!userId) return res.status(401).json({ message: 'Faça login para comentar.' });

    try {
      const novo = await Comentario.create({ texto, estrelas, receitaId, userId });
      const usuario = await User.findByPk(userId);
      res.json({ success: true, comentario: { ...novo.toJSON(), nome: usuario.nome } });
    } catch (err) {
      console.error('Erro ao criar comentário:', err);
      res.status(500).json({ success: false, message: 'Erro ao comentar.' });
    }
  },

  async listarPorReceita(req, res) {
    const { receitaId } = req.params;

    try {
      const comentarios = await Comentario.findAll({
        where: { receitaId },
        include: [{ model: User, attributes: ['id', 'nome'] }],
        order: [['createdAt', 'DESC']]
      });
      res.json(comentarios);
    } catch (err) {
      console.error('Erro ao listar comentários:', err);
      res.status(500).json({ message: 'Erro ao buscar comentários.' });
    }
  },

  async deletar(req, res) {
    const { id } = req.params;
    const userId = req.session.userId;

    try {
      const comentario = await Comentario.findByPk(id);
      if (!comentario || comentario.userId !== userId) {
        return res.status(403).json({ message: 'Não autorizado.' });
      }

      await comentario.destroy();
      res.json({ success: true });
    } catch (err) {
      console.error('Erro ao deletar comentário:', err);
      res.status(500).json({ message: 'Erro ao deletar comentário.' });
    }
  }
};

module.exports = ComentarioController;
