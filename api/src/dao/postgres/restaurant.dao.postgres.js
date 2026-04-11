import { query } from '../../config/db.js';

// DAO de restaurantes para PostgreSQL
// Contiene todas las operaciones SQL de restaurantes
export class RestaurantDAOPostgres {

  // Registra un nuevo restaurante usando la función SQL
  async create(nombre, direccion, telefono) {
    const result = await query(
      'SELECT restaurant.registrar_restaurante($1, $2, $3) AS id',
      [nombre, direccion, telefono]
    );
    return result.rows[0];
  }

  // Lista todos los restaurantes
  async findAll() {
    const result = await query(
      'SELECT * FROM restaurant.listar_restaurantes()'
    );
    return result.rows;
  }
}