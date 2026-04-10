// Importa la función query para hacer consultas a PostgreSQL
import { query } from '../config/db.js';

// Obtiene los detalles de un usuario por su ID
// Llama a la función SQL get_detalles_user  de funciones.sql
export async function getUserById(keycloakId) {
  const result = await query(
    `SELECT u.id, u.nombre, u.correo, r.nombre AS rol
     FROM restaurant.usuario u
     JOIN restaurant.rol_usuario r ON u.id_rol_usuario = r.id
     WHERE u.id_external_auth = $1`,
    [keycloakId]
  );
  // rows[0] es el primer (y único) resultado de la consulta
  return result.rows[0];
}

// Actualiza el nombre y correo de un usuario por su ID
// Llama a la función SQL actualizar_user
export async function updateUser(id, nombre, correo) {
  await query(
    `UPDATE restaurant.usuario
     SET nombre = $2, correo = $3
     WHERE id = $1`,
    [id, nombre, correo]
  );
  // Retorna un mensaje de confirmación
  return { message: 'Usuario actualizado correctamente' };
}

// Elimina un usuario por su ID
// Llama a la función SQL borrar_user
export async function deleteUser(id) {
  await query(
    `DELETE FROM restaurant.usuario
     WHERE id = $1`,
    [id]
  );
  return { message: 'Usuario eliminado correctamente' };
}