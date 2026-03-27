// Importa las funciones del servicio de usuarios
import { getUserById, updateUser, deleteUser } from '../services/users.service.js';

// Controlador para obtener el perfil del usuario autenticado
// Maneja la petición GET /users/me
export async function getMe(req, res) {
  try {
    // req.auth lo pone el middleware checkJwt después de verificar el token
    // sub es el ID del usuario en Keycloak
    const keycloakId = req.auth.sub;

    // Busca el usuario en la base de datos usando su ID de Keycloak
    const result = await getUserById(keycloakId);

    // Si no existe el usuario en la base de datos responde con 404
    if (!result) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Responde con los datos del usuario
    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controlador para actualizar los datos de un usuario
// Maneja la petición PUT /users/:id
export async function update(req, res) {
  try {
    // El :id viene de la URL, por ejemplo /users/5
    const { id } = req.params;

    // Los nuevos datos vienen del body
    const { nombre, correo } = req.body;

    // Verifica que al menos uno de los campos esté presente
    if (!nombre || !correo) {
      return res.status(400).json({ error: 'nombre y correo son obligatorios' });
    }

    // Llama al servicio para actualizar el usuario
    const result = await updateUser(id, nombre, correo);

    // Responde con mensaje de confirmación
    res.status(200).json(result);

  } catch (error) {
    const status = error.message === 'Usuario no encontrado' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
}

// Controlador para eliminar un usuario
// Maneja la petición DELETE /users/:id
export async function remove(req, res) {
  try {
    // El :id viene de la URL
    const { id } = req.params;

    // Llama al servicio para eliminar el usuario
    const result = await deleteUser(id);

    // Responde con mensaje de confirmación
    res.status(200).json(result);

  } catch (error) {
    const status = error.message === 'Usuario no encontrado' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
}