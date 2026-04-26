import { PostgresBaseDAO } from '../PostgresBaseDAO.js';

/**
 * UserDAOPostgres — DAO de usuarios para PostgreSQL.
 *
 * Aunque la autenticación se gestiona con Keycloak, existe una tabla
 * local `restaurant.usuario` que almacena datos complementarios
 * (nombre, correo, rol) y la referencia al ID de Keycloak.
 *
 * Este DAO maneja SOLO el acceso a esa tabla local.
 * La comunicación con Keycloak (register, login, tokens) es
 * responsabilidad de AuthService y UserService, no de este DAO.
 *
 * Cambios respecto al código anterior:
 *  - Extiende PostgresBaseDAO
 *  - Recibe pool por inyección
 *  - update recibe objeto data para cumplir el contrato de BaseDAO
 *  - delete retorna boolean (contrato de BaseDAO) en vez de mensaje
 *    (los mensajes de respuesta son responsabilidad del controlador)
 */
export class UserDAOPostgres extends PostgresBaseDAO {
  constructor(pool) {
    super(pool, 'restaurant.usuario', 'id');
  }

  /**
   * Busca el usuario local por su ID de Keycloak.
   * Usado en GET /users/me para obtener el perfil completo con rol.
   *
   * @param {string} keycloakId
   * @returns {Promise<Object|null>}
   */
  async findByExternalId(keycloakId) {
    const result = await this._query(
      `SELECT u.id, u.nombre, u.correo, r.nombre AS rol
       FROM restaurant.usuario u
       JOIN restaurant.rol_usuario r ON u.id_rol_usuario = r.id
       WHERE u.id_external_auth = $1`,
      [keycloakId]
    );
    return result.rows[0] ?? null;
  }

  /**
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const result = await this._query(
      `SELECT u.id, u.nombre, u.correo, r.nombre AS rol
       FROM restaurant.usuario u
       JOIN restaurant.rol_usuario r ON u.id_rol_usuario = r.id
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  /**
   * Actualiza nombre y/o correo del usuario local.
   * Sobreescribe el update genérico para asegurar que solo se
   * actualicen los campos permitidos.
   *
   * @param {number} id
   * @param {{ nombre?: string, correo?: string }} data
   * @returns {Promise<Object|null>} — El usuario actualizado.
   */
  async update(id, { nombre, correo }) {
    // Construimos dinámicamente solo los campos enviados
    const fields  = [];
    const values  = [];
    let   counter = 1;

    if (nombre !== undefined) { fields.push(`nombre = $${counter++}`); values.push(nombre); }
    if (correo !== undefined) { fields.push(`correo = $${counter++}`); values.push(correo); }

    if (fields.length === 0) throw new Error('No hay campos para actualizar');

    values.push(id);
    const result = await this._query(
      `UPDATE restaurant.usuario
       SET ${fields.join(', ')}
       WHERE id = $${counter}
       RETURNING id, nombre, correo`,
      values
    );
    return result.rows[0] ?? null;
  }

  /**
   * Elimina el usuario local. El servicio se encarga también de
   * eliminarlo en Keycloak.
   *
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const result = await this._query(
      `DELETE FROM restaurant.usuario WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }
}