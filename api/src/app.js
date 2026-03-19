// Importa el framework Express para crear el servidor web
import express from 'express';


// Importa las rutas de cada módulo
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import restaurantsRoutes from './routes/restaurants.routes.js';
import menusRoutes from './routes/menus.routes.js';

// Crea la aplicación Express
const app = express();

// Middleware global que permite leer el body de las peticiones en formato JSON
app.use(express.json());

// Monta cada grupo de rutas en su URL base
// Todo lo que llegue a /auth lo maneja auth.routes.js
app.use('/auth', authRoutes);
// Todo lo que llegue a /users lo maneja users.routes.js
app.use('/users', usersRoutes);
// Todo lo que llegue a /restaurants lo maneja restaurants.routes.js
app.use('/restaurants', restaurantsRoutes);
// Todo lo que llegue a /menus lo maneja menus.routes.js
app.use('/menus', menusRoutes);



app.get('/public', (req, res) => {
  res.send('Ruta pública');
});

// Arranca el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('API corriendo en http://localhost:3000');
});