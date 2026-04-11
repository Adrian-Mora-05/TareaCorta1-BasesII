import { RestaurantDAOPostgres } from './postgres/restaurant.dao.postgres.js';
import { RestaurantDAOMongo } from './mongodb/restaurant.dao.mongo.js';
import { MenuDAOPostgres } from './postgres/menu.dao.postgres.js';
import { MenuDAOMongo } from './mongodb/menu.dao.mongo.js';
import { UserDAOPostgres } from './postgres/user.dao.postgres.js';
import { UserDAOMongo } from './mongodb/user.dao.mongo.js';
//import { ReservationDAOPostgres } from './postgres/reservation.dao.postgres.js';
//import { ReservationDAOMongo } from './mongodb/reservation.dao.mongo.js';
//import { OrderDAOPostgres } from './postgres/order.dao.postgres.js';
//import { OrderDAOMongo } from './mongodb/order.dao.mongo.js';

// Lee la variable de entorno para saber qué base de datos usar
// Si no está definida usa PostgreSQL por defecto
const DB_TYPE = process.env.DB_TYPE || 'postgres';

// Cada función devuelve el DAO correcto según DB_TYPE
// Los services llaman a estas funciones sin saber qué base de datos hay abajo

export function getRestaurantDAO() {
  return DB_TYPE === 'mongodb'
    ? new RestaurantDAOMongo()
    : new RestaurantDAOPostgres();
}

export function getMenuDAO() {
  return DB_TYPE === 'mongodb'
    ? new MenuDAOMongo()
    : new MenuDAOPostgres();
}

export function getUserDAO() {
  return DB_TYPE === 'mongodb'
    ? new UserDAOMongo()
    : new UserDAOPostgres();
}

export function getReservationDAO() {
  return DB_TYPE === 'mongodb'
    ? new ReservationDAOMongo()
    : new ReservationDAOPostgres();
}

export function getOrderDAO() {
  return DB_TYPE === 'mongodb'
    ? new OrderDAOMongo()
    : new OrderDAOPostgres();
}