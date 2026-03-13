import { query } from '../config/db.js'; //

export async function createRestaurant(nombre, direccion, telefono) {

  const result = await query(
    'SELECT restaurant.registrar_restaurante($1,$2,$3) AS id',
    [nombre, direccion, telefono]
  );

  return result.rows[0];
}

export async function getRestaurants() {

  const result = await query(
    'SELECT * FROM restaurant.listar_restaurantes()'
  );

  return result.rows;
}

