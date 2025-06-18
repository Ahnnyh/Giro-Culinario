const express = require('express');
const router = express.Router();
const FavoritoController = require('../controllers/FavoritoController');

router.get('/', FavoritoController.listarFavoritos);
router.post('/', FavoritoController.adicionarFavorito);
router.delete('/:receitaId', FavoritoController.removerFavorito); // ← esse método precisa existir

module.exports = router;
