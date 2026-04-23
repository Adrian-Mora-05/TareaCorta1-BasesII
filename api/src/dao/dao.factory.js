import { RestaurantDAOPostgres } from './postgres/restaurant.dao.postgres.js';
import { RestaurantDAOMongo } from './mongodb/restaurant.dao.mongo.js';
import { MenuDAOPostgres } from './postgres/menu.dao.postgres.js';
import { MenuDAOMongo } from './mongodb/menu.dao.mongo.js';
import { UserDAOPostgres } from './postgres/user.dao.postgres.js';
import { UserDAOMongo } from './mongodb/user.dao.mongo.js';
import { ReservationPostgresDAO } from './postgres/reservation.dao.postgres.js';
import { ReservationMongoDAO } from './mongodb/reservation.dao.mongo.js';
import { OrderDAOPostgres } from './postgres/order.dao.postgres.js';
import { OrderDAOMongo } from './mongodb/order.dao.mongo.js';

const DB_TYPE = process.env.DB_TYPE || 'postgres';

export function getRestaurantDAO() {
  return DB_TYPE === 'mongo' ? new RestaurantDAOMongo() : new RestaurantDAOPostgres();
}

export function getMenuDAO() {
  return DB_TYPE === 'mongo' ? new MenuDAOMongo() : new MenuDAOPostgres();
}

export function getUserDAO() {
  return DB_TYPE === 'mongo' ? new UserDAOMongo() : new UserDAOPostgres();
}

export function getReservationDAO() {
  return DB_TYPE === 'mongo' ? new ReservationMongoDAO() : new ReservationPostgresDAO();
}

export function getOrderDAO() {
  return DB_TYPE === 'mongo' ? new OrderDAOMongo() : new OrderDAOPostgres();
}