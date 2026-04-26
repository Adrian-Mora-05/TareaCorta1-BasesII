/* Importa el framework Express para crear el servidor web
import express from 'express';
import 'dotenv/config'; //--------------------
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// ── Conexiones ────────────────────────────────────────────────────
import { pool }         from './config/postgresdb.js';  // Pool de pg
import { connectMongo } from './config/mongo.js';       // Retorna db de Mongo
 
import { DAOFactory }   from './dao/DAOFactory.js';

// Importa las rutas de cada módulo
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import restaurantsRoutes from './routes/restaurants.routes.js';
import menusRoutes from './routes/menus.routes.js';
import reservationsRoutes from './routes/reservations.routes.js';
import ordersRoutes from './routes/orders.routes.js';

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
// Todo lo que llegue a /reservations lo maneja reservations.routes.js
app.use('/reservations', reservationsRoutes);
// Todo lo que llegue a /orders lo maneja orders.routes.js
app.use('/orders', ordersRoutes);

// Ruta de documentación — no necesita auth
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/public', (req, res) => {
  res.send('Ruta pública');
});

export async function initApp() {
  if (process.env.DB_TYPE === 'mongo') {
    await connectMongo();
  }
  return app;
}


export default app; // */


/**
 * app.js — Composición de dependencias e inyección.
 *
 * Responsabilidades:
 *  1. Leer DB_ENGINE del entorno.
 *  2. Establecer la conexión con el motor elegido.
 *  3. Instanciar DAOFactory (único IF de BD).
 *  4. Obtener DAOs e inyectarlos en los servicios.
 *  5. Inyectar servicios en controladores.
 *  6. Inyectar controladores en las rutas.
 *  7. Montar rutas en Express.
 *
 * A partir de aquí, ningún otro archivo sabe qué motor de BD se usa.
 */

/**
 * app.js — Composición de dependencias e inyección.
 *
 * Responsabilidades:
 *  1. Leer DB_ENGINE del entorno.
 *  2. Establecer la conexión con el motor elegido.
 *  3. Instanciar DAOFactory (único IF de BD).
 *  4. Obtener DAOs e inyectarlos en los servicios.
 *  5. Inyectar servicios en controladores.
 *  6. Inyectar controladores en las rutas.
 *  7. Montar rutas en Express.
 *
 * A partir de aquí, ningún otro archivo sabe qué motor de BD se usa.
 */

/**
 * app.js — Composición de dependencias e inyección.
 *
 * Responsabilidades:
 *  1. Leer DB_ENGINE del entorno.
 *  2. Establecer la conexión con el motor elegido.
 *  3. Instanciar DAOFactory (único IF de BD).
 *  4. Obtener DAOs e inyectarlos en los servicios.
 *  5. Inyectar servicios en controladores.
 *  6. Inyectar controladores en las rutas.
 *  7. Montar rutas en Express.
 *
 * A partir de aquí, ningún otro archivo sabe qué motor de BD se usa.
 */

import express from 'express';
import 'dotenv/config';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';


// ── Conexiones ────────────────────────────────────────────────────
import { pool }         from './config/postgresdb.js';  // Pool de pg
import { connectMongo } from './config/mongo.js';       // Retorna db de Mongo

import { DAOFactory }   from './dao/DAOFactory.js';

// ── Servicios ─────────────────────────────────────────────────────
import { RestaurantService }  from './services/restaurants.service.js';
import { MenuService }        from './services/menus.service.js';
import { ReservationService } from './services/reservations.service.js';
import { OrderService }       from './services/orders.service.js';
import { AuthService }        from './services/auth.service.js';  // Solo Keycloak
import { UserService }        from './services/users.service.js'; // Solo Keycloak

// ── Controladores ─────────────────────────────────────────────────
import { RestaurantController }  from './controllers/restaurants.controller.js';
import { MenuController }        from './controllers/menus.controller.js';
import { ReservationController } from './controllers/reservations.controller.js';
import { OrderController }       from './controllers/orders.controller.js';
import { AuthController }        from './controllers/auth.controller.js';
import { UserController }        from './controllers/users.controller.js';

// ── Rutas ─────────────────────────────────────────────────────────
import { createRestaurantRouter }  from './routes/restaurants.routes.js';
import { createMenuRouter }        from './routes/menus.routes.js';
import { createReservationRouter } from './routes/reservations.routes.js';
import { createOrderRouter }       from './routes/orders.routes.js';
import { createAuthRouter }        from './routes/auth.routes.js';
import { createUserRouter }        from './routes/users.routes.js';

export async function createApp() {
  const app = express();
  app.use(express.json());

  // ── 1. Resolver la conexión según el motor ──────────────────────
  //    ÚNICO lugar donde DB_ENGINE determina qué conexión se usa.
  //    Todo lo que sigue es agnóstico al motor.
  const engine = process.env.DB_ENGINE || 'postgres';
  const connection = engine === 'mongodb'
    ? await connectMongo()  // Retorna instancia `db` de Mongo
    : pool;                 // Pool de pg ya instanciado al importar

  // ── 2. Instanciar la fábrica ────────────────────────────────────
  //    DAOFactory tiene el ÚNICO IF que decide qué clases DAO usar.
  const factory = new DAOFactory(engine, connection);

  // ── 3. Obtener DAOs ─────────────────────────────────────────────
  const restaurantDAO  = factory.getDAO('restaurant');
  const menuDAO        = factory.getDAO('menu');
  const reservationDAO = factory.getDAO('reservation');
  const orderDAO       = factory.getDAO('order');
  // Auth y Users no tienen DAO: Keycloak los gestiona vía HTTP

  // ── 4. Instanciar servicios ─────────────────────────────────────
  const restaurantService  = new RestaurantService(restaurantDAO);
  const menuService        = new MenuService(menuDAO);
  const reservationService = new ReservationService(reservationDAO);
  const orderService       = new OrderService(orderDAO);
  const authService        = new AuthService();
  const userService        = new UserService();

  // ── 5. Instanciar controladores ─────────────────────────────────
  const restaurantController  = new RestaurantController(restaurantService);
  const menuController        = new MenuController(menuService);
  const reservationController = new ReservationController(reservationService);
  const orderController       = new OrderController(orderService);
  const authController        = new AuthController(authService);
  const userController        = new UserController(userService);

  // ── 6. Montar rutas ─────────────────────────────────────────────
  app.use('/api/restaurants',  createRestaurantRouter(restaurantController));
  app.use('/api/menus',        createMenuRouter(menuController));
  app.use('/api/reservations', createReservationRouter(reservationController));
  app.use('/api/orders',       createOrderRouter(orderController));
  app.use('/api/auth',         createAuthRouter(authController));
  app.use('/api/users',        createUserRouter(userController));

  return app;
}