const Favorito = require('../models/Favorito');

module.exports = {
  async listarFavoritos(req, res) {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: 'Não autorizado' });

    const favoritos = await Favorito.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json(favoritos);
  },

  async adicionarFavorito(req, res) {
    const userId = req.session.userId;
    const { receitaId } = req.body;
    if (!userId) return res.status(401).json({ message: 'Não autorizado' });

    const existente = await Favorito.findOne({ where: { userId, receitaId } });
    if (existente) {
      await existente.destroy();
      return res.json({ success: true, favorito: null });
    } else {
      const favorito = await Favorito.create({ userId, receitaId });
      return res.json({ success: true, favorito });
    }
  },

  //  FUNÇÃO: removerFavorito via DELETE
  async removerFavorito(req, res) {
    const userId = req.session.userId;
    const receitaId = req.params.receitaId;

    if (!userId) return res.status(401).json({ message: 'Não autorizado' });

    try {
      const favorito = await Favorito.findOne({ where: { userId, receitaId } });
      if (!favorito) {
        return res.status(404).json({ message: 'Favorito não encontrado.' });
      }

      await favorito.destroy();
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      res.status(500).json({ message: 'Erro ao remover favorito.' });
    }
  }
};
