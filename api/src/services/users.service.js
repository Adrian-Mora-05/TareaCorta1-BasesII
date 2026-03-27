// Importa la función query para hacer consultas a PostgreSQL
import { query } from '../config/db.js';

// Obtiene los detalles de un usuario por su ID
// Llama a la función SQL get_detalles_user que creamos en 03_funciones.sql
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
  const result =await query(
    `UPDATE restaurant.usuario
     SET nombre = $2, correo = $3
     WHERE id = $1
     RETURNING id`, // RETURNING id nos permite verificar que la actualización se realizó correctamente
    [id, nombre, correo]
  );

  // Si no actualizó ninguna fila, el usuario no existe
  if (result.rowCount === 0) {
    throw new Error('Usuario no encontrado');
  }

  // Retorna un mensaje de confirmación
  return { message: 'Usuario actualizado correctamente' };
}

// Elimina un usuario por su ID
// Llama a la función SQL borrar_user
export async function deleteUser(id) {
  const result = await query(
    `DELETE FROM restaurant.usuario
     WHERE id = $1
     RETURNING id`, // RETURNING id nos permite verificar que la eliminación se realizó correctamente
    [id]
  );
  // Si no eliminó ninguna fila, el usuario no existe
  if (result.rowCount === 0) {
    throw new Error('Usuario no encontrado');
  }
  return { message: 'Usuario eliminado correctamente' };
}