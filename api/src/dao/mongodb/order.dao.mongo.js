import { getMongo } from '../../config/mongo.js';
import { ObjectId } from 'mongodb';

export class OrderDAOMongo {

  get collection() {
    return getMongo().collection('pedidos');
  }

  get usuarios() {
    return getMongo().collection('usuarios');
  }

  get restaurantes() {
    return getMongo().collection('restaurantes');
  }

  get platos() {
    return getMongo().collection('platos');
  }

  async getUserByKeycloakId(keycloakId) {
    const user = await this.usuarios.findOne({ id_external_auth: keycloakId });
    return user?._id?.toString();
  }

  async validateRestaurant(id_restaurante) {
    const rest = await this.restaurantes.findOne({ _id: new ObjectId(id_restaurante) });
    return !!rest;
  }

  async create(id_usuario, id_restaurante, descripcion, tipo_pedido, platos) {
    let total = 0;
    const detalles = [];

    for (const item of platos) {
      const plato = await this.platos.findOne({ _id: new ObjectId(item.id_plato) });
      if (!plato) throw new Error(`Plato ${item.id_plato} no existe`);
      const subtotal = plato.precio * item.cantidad;
      total += subtotal;
      detalles.push({
        id_plato: item.id_plato,
        cantidad: item.cantidad,
        subtotal
      });
    }

    const result = await this.collection.insertOne({
      id_usuario,
      id_restaurante,
      descripcion,
      id_tipo_pedido: tipo_pedido,
      precio_total: total,
      id_estado_pedido: 1,
      platos: detalles,
      createdAt: new Date()
    });

    return { id: result.insertedId.toString() };
  }

  async findById(id) {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!doc) return undefined;
    return {
      id: doc._id.toString(),
      usuario: doc.id_usuario,
      restaurante: doc.id_restaurante,
      descripcion: doc.descripcion,
      precio_total: doc.precio_total,
      estado: doc.id_estado_pedido,
      tipo: doc.id_tipo_pedido
    };
  }
}