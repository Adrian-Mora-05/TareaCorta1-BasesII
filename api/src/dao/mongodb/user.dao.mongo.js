import User from '../../models/user.model.js';

// DAO de usuarios para MongoDB
export class UserDAOMongo {

  // Busca un usuario por su ID de Keycloak
  async findByExternalId(keycloakId) {
    const user = await User.findOne({ id_external_auth: keycloakId });
    if (!user) return undefined;
    return {
      id: user._id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    };
  }

  // Actualiza nombre y correo de un usuario
  async update(id, nombre, correo) {
    await User.findByIdAndUpdate(id, { nombre, correo });
    return { message: 'Usuario actualizado correctamente' };
  }

  // Elimina un usuario por su ID
  async delete(id) {
    await User.findByIdAndDelete(id);
    return { message: 'Usuario eliminado correctamente' };
  }
}