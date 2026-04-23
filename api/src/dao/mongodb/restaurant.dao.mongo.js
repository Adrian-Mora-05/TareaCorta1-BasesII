import { getMongo } from '../../config/mongo.js';

export class RestaurantDAOMongo {

  get collection() {
    return getMongo().collection('restaurantes');
  }

  async create(nombre, direccion, telefono) {
    const result = await this.collection.insertOne({
      nombre,
      direccion,
      telefono,
      createdAt: new Date()
    });
    return { id: result.insertedId.toString() };
  }

  async findAll() {
    const docs = await this.collection.find().toArray();
    return docs.map(r => ({
      id: r._id.toString(),
      nombre: r.nombre,
      direccion: r.direccion,
      telefono: r.telefono
    }));
  }
}