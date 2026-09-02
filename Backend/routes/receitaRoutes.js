const express = require('express');
const router = express.Router();
const ReceitaController = require('../controllers/ReceitaController');

// Atenção à ordem: /destaques precisa vir antes de /:id, senão "destaques" seria
// interpretado como um id de receita.
router.get('/destaques', ReceitaController.listarDestaques);
router.get('/', ReceitaController.listar);
router.get('/:id', ReceitaController.buscarPorId);

module.exports = router;
