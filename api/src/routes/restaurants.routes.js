const express = require('express');
const router = express.Router();

const { checkJwt } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

router.post(
  '/',
  checkJwt,
  requireRole('admin'),
  (req, res) => {
    res.send("Restaurante creado");
  }
);

router.get('/', (req, res) => {
  res.send("Lista de restaurantes");
});

module.exports = router;