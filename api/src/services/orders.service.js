import { query } from '../config/db.js';

export async function createOrder(
  keycloakId,
  id_restaurante,
  descripcion,
  tipo_pedido,
  platos
) {

  // buscar id numérico igual que en reservations
  const userResult = await query(
    `SELECT id FROM restaurant.usuario WHERE id_external_auth = $1`,
    [keycloakId]
  );

  const id_usuario = userResult.rows[0]?.id;
  if (!id_usuario) throw new Error('Usuario no encontrado en base de datos');

    // Validar que el restaurante existe 
  const restResult = await query(
    `SELECT id FROM restaurant.restaurante WHERE id = $1`,
    [id_restaurante]
  );
  if (restResult.rowCount === 0) {
    throw new Error(`Restaurante ${id_restaurante} no existe`);
  }

  const result = await query(
    'SELECT restaurant.realizar_pedido($1, $2, $3, $4, $5) AS id',
    [id_usuario, id_restaurante, descripcion, tipo_pedido, JSON.stringify(platos)]
  );

  const id = result.rows[0]?.id ?? result.rows[0]?.realizar_pedido;
  if (!id) throw new Error('No se pudo crear el pedido');

  return { id };
}

export async function getOrderById(id) {
  const result = await query(
    'SELECT * FROM restaurant.get_detalles_pedido($1)',
    [id]
  );

  return result.rows[0];
}