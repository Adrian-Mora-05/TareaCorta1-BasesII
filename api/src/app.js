import express from 'express';
import restaurantsRoutes from './routes/restaurants.routes.js'; 

const app = express();

app.use(express.json());

app.use('/restaurants', restaurantsRoutes);

app.get('/', (req, res) => {
  res.send('API Restaurant funcionando correctamente 🚀');
});

app.get('/public', (req, res) => {
  res.send('Ruta pública');
});

app.listen(3000, () => {
  console.log('API corriendo en http://localhost:3000');
});