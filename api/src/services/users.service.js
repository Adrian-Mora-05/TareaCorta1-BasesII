// Importa la función query para hacer consultas a PostgreSQL
import { getUserDAO } from '../dao/dao.factory.js';

// Obtiene los detalles de un usuario por su ID
// Llama a la función SQL get_detalles_user  de funciones.sql
export async function getUserById(keycloakId) {
  const dao = getUserDAO();
  return await dao.findByExternalId(keycloakId);
}

// Actualiza el nombre y correo de un usuario por su ID
// Llama a la función SQL actualizar_user
export async function updateUser(id, nombre, correo) {
  const dao = getUserDAO();
  return await dao.update(id, nombre, correo);
}

// Elimina un usuario por su ID
// Llama a la función SQL borrar_user
export async function deleteUser(id) {
  const dao = getUserDAO();
  return await dao.delete(id);
}