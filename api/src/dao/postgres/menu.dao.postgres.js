import { query } from '../../config/db.js';

// DAO de menús para PostgreSQL
export class MenuDAOPostgres {

  // Crea un nuevo menú usando la función SQL
  async create(nombre, idRestaurante) {
    const result = await query(
      'SELECT restaurant.crear_menu($1, $2) AS id',
      [nombre, idRestaurante]
    );
    return result.rows[0];
  }
}