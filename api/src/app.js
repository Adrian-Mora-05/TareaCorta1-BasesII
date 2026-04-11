// Importa el framework Express para crear el servidor web
import express from 'express';
import 'dotenv/config'; //--------------------
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// Importa las rutas de cada módulo
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import restaurantsRoutes from './routes/restaurants.routes.js';
import menusRoutes from './routes/menus.routes.js';
import reservationsRoutes from './routes/reservations.routes.js';
import ordersRoutes from './routes/orders.routes.js';

import { connectMongo } from './config/mongodb.js';
// PONER ACÁ QUE SE CONECTE A MONGO

// Crea la aplicación Express
const app = express();

// Middleware global que permite leer el body de las peticiones en formato JSON
app.use(express.json());


// Si DB_TYPE es mongodb conecta a MongoDB al arrancar
// Si es postgres no hace nada porque el pool ya maneja la conexión
if (process.env.DB_TYPE === 'mongodb') {
  await connectMongo();
}

// Monta cada grupo de rutas en su URL base
// Todo lo que llegue a /auth lo maneja auth.routes.js
app.use('/auth', authRoutes);
// Todo lo que llegue a /users lo maneja users.routes.js
app.use('/users', usersRoutes);
// Todo lo que llegue a /restaurants lo maneja restaurants.routes.js
app.use('/restaurants', restaurantsRoutes);
// Todo lo que llegue a /menus lo maneja menus.routes.js
app.use('/menus', menusRoutes);
// Todo lo que llegue a /reservations lo maneja reservations.routes.js
app.use('/reservations', reservationsRoutes);
// Todo lo que llegue a /orders lo maneja orders.routes.js
app.use('/orders', ordersRoutes);

// Ruta de documentación — no necesita auth
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/public', (req, res) => {
  res.send('Ruta pública');
});

app.listen(3000, () => {//------------------------
  console.log('API corriendo en http://localhost:3000');
});

export default app; //