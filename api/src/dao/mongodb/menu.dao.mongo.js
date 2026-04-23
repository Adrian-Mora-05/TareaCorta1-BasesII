import { getMongo } from '../../config/mongo.js';
import { ObjectId } from 'mongodb';

export class MenuDAOMongo {

  get collection() {
    return getMongo().collection('menus');
  }

  async create(nombre, idRestaurante) {
    const result = await this.collection.insertOne({
      nombre,
      id_restaurante: idRestaurante,
      ultima_actualizacion: new Date()
    });
    return { id: result.insertedId.toString() };
  }

  async findById(id) {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!doc) return undefined;
    return {
      id: doc._id.toString(),
      nombre: doc.nombre,
      id_restaurante: doc.id_restaurante,
      ultima_actualizacion: doc.ultima_actualizacion
    };
  }

  async update(id, nombre) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { nombre, ultima_actualizacion: new Date() } }
    );
    if (result.matchedCount === 0) throw new Error('Menú no encontrado');
  }

  async delete(id) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) throw new Error('Menú no encontrado');
  }
}