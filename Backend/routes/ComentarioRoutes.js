const express = require('express');
const router = express.Router();
const ComentarioController = require('../controllers/ComentarioController');
const auth = require('../controllers/authController');

router.post('/', auth.isAuthenticated, ComentarioController.criar);
router.get('/:receitaId', ComentarioController.listarPorReceita);
router.delete('/:id', auth.isAuthenticated, ComentarioController.deletar);

module.exports = router;
