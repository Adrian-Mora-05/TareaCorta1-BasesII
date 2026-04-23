import { getMongo } from '../../config/mongo.js';
import { ObjectId } from 'mongodb';

export class UserDAOMongo {

  get collection() {
    return getMongo().collection('usuarios');
  }

  async findByExternalId(keycloakId) {
    const doc = await this.collection.findOne({ id_external_auth: keycloakId });
    if (!doc) return undefined;
    return {
      id: doc._id.toString(),
      nombre: doc.nombre,
      correo: doc.correo,
      rol: doc.rol
    };
  }

  async update(id, nombre, correo) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { nombre, correo } }
    );
    if (result.matchedCount === 0) throw new Error('Usuario no encontrado');
    return { message: 'Usuario actualizado correctamente' };
  }

  async delete(id) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) throw new Error('Usuario no encontrado');
    return { message: 'Usuario eliminado correctamente' };
  }
}