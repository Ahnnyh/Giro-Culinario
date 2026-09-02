const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const path = require('path');

// Rota da home (protegida)
router.get('/home', authController.isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../../TodasReceitas/Home.html'));
});

module.exports = router;