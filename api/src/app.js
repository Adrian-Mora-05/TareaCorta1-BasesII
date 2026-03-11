const express = require('express');
const { checkJwt } = require('./middlewares/auth');

const app = express();
app.use(express.json());

// Ruta pública
app.get('/public', (req, res) => {
  res.send('Esta ruta es pública, no necesita token.');
});

// Ruta protegida
app.get('/protected', checkJwt, (req, res) => {
  res.send(`Hola ${req.user.preferred_username}, accediste con token válido`);
});

app.listen(3000, () => {
  console.log('API corriendo en http://localhost:3000');
});