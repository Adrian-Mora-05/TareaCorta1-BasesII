require('dotenv').config();

const express = require('express');
const app = express();

const { checkJwt } = require('./middlewares/auth');  // middleware JWT actual
const { requireRole } = require('./middlewares/roles');  // middleware de roles que creaste
const restaurantsRoutes = require('./routes/restaurants.routes'); // ruta que hiciste

app.use(express.json());

// Montamos solo la ruta /restaurants para probar
app.use('/restaurants', restaurantsRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor de prueba corriendo en http://localhost:${PORT}`);
});