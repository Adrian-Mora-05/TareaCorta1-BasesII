import { query } from '../../config/postgresdb.js';

export class MenuDAOPostgres {

  async create(nombre, idRestaurante) {
    const result = await query(
      'SELECT restaurant.crear_menu($1, $2) AS id',
      [nombre, idRestaurante]
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await query(
      'SELECT * FROM restaurant.get_detalles_menu($1)',
      [id]
    );
    return result.rows[0];
  }

  async update(id, nombre) {
    const result = await query(
      'SELECT restaurant.actualizar_menu($1, $2)',
      [id, nombre]
    );
    if (!result) throw new Error('Menú no encontrado');
  }

  async delete(id) {
    await query(
      'SELECT restaurant.borrar_menu($1)',
      [id]
    );
  }
}