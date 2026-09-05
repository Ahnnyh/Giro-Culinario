const express = require('express');
const router = express.Router();
const multer = require('multer');
const ReceitaController = require('../controllers/ReceitaController');
const authController = require('../controllers/authController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB, mesmo limite do plano gratuito do ImageKit
});

// Atenção à ordem: /destaques precisa vir antes de /:id, senão "destaques" seria
// interpretado como um id de receita.
router.get('/destaques', ReceitaController.listarDestaques);
router.get('/', ReceitaController.listar);

router.post(
  '/',
  authController.isAuthenticated,
  upload.fields([{ name: 'imagemPrincipal', maxCount: 1 }, { name: 'midiaPreparo', maxCount: 1 }]),
  ReceitaController.criar
);

router.get('/:id', ReceitaController.buscarPorId);

module.exports = router;
