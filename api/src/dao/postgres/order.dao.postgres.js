import { query } from '../../config/postgresdb.js';

export class OrderDAOPostgres {

  async getUserByKeycloakId(keycloakId) {
    const result = await query(
      `SELECT id FROM restaurant.usuario WHERE id_external_auth = $1`,
      [keycloakId]
    );
    return result.rows[0]?.id;
  }

  async validateRestaurant(id_restaurante) {
    const result = await query(
      `SELECT id FROM restaurant.restaurante WHERE id = $1`,
      [id_restaurante]
    );
    return result.rowCount > 0;
  }

  async create(id_usuario, id_restaurante, descripcion, tipo_pedido, platos) {
    const result = await query(
      'SELECT restaurant.realizar_pedido($1, $2, $3, $4, $5) AS id',
      [id_usuario, id_restaurante, descripcion, tipo_pedido, JSON.stringify(platos)]
    );
    const id = result.rows[0]?.id ?? result.rows[0]?.realizar_pedido;
    if (!id) throw new Error('No se pudo crear el pedido');
    return { id };
  }

  async findById(id) {
    const result = await query(
      'SELECT * FROM restaurant.get_detalles_pedido($1)',
      [id]
    );
    return result.rows[0];
  }
}