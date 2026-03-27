import { query } from '../config/db.js';

export async function createReservation(
  keycloakId,
  id_restaurante,
  id_mesa,
  fecha,
  duracion,
  personas
) {

  // primero buscar el id numérico del usuario
  const userResult = await query(
    `SELECT id FROM restaurant.usuario WHERE id_external_auth = $1`,
    [keycloakId]
  );

  const id_usuario = userResult.rows[0]?.id;
  if (!id_usuario) throw new Error('Usuario no encontrado en base de datos');


  const result = await query(
    'SELECT restaurant.reservar($1, $2, $3, $4, $5, $6) AS id',
    [id_usuario, id_restaurante, id_mesa, fecha, duracion, personas]
  );
  
  console.log('resultado reserva:', result.rows); // 👈 agrega esto temporalmente
  return result.rows[0];
}

export async function cancelReservation(id) {

  // verificar que la reserva existe antes de cancelar
  const check = await query(
    `SELECT id FROM restaurant.reservacion WHERE id = $1`,
    [id]
  );

  if (check.rowCount === 0) {
    throw new Error('Reserva no encontrada');
  }

  await query('SELECT restaurant.cancelar_reserva($1)', [id]);
}