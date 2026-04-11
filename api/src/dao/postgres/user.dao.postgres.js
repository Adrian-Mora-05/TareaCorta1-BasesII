import { query } from '../../config/db.js';

// DAO de usuarios para PostgreSQL
export class UserDAOPostgres {

  // Busca un usuario por su ID de Keycloak
  async findByExternalId(keycloakId) {
    const result = await query(
      `SELECT u.id, u.nombre, u.correo, r.nombre AS rol
       FROM restaurant.usuario u
       JOIN restaurant.rol_usuario r ON u.id_rol_usuario = r.id
       WHERE u.id_external_auth = $1`,
      [keycloakId]
    );
    return result.rows[0];
  }

  // Actualiza nombre y correo de un usuario
  async update(id, nombre, correo) {
    await query(
      `UPDATE restaurant.usuario SET nombre = $2, correo = $3 WHERE id = $1`,
      [id, nombre, correo]
    );
    return { message: 'Usuario actualizado correctamente' };
  }

  // Elimina un usuario por su ID
  async delete(id) {
    await query(
      `DELETE FROM restaurant.usuario WHERE id = $1`,
      [id]
    );
    return { message: 'Usuario eliminado correctamente' };
  }
}