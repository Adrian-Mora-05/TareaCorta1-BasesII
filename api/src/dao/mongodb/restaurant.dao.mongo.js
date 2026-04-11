import Restaurant from '../../models/restaurant.model.js';

// DAO de restaurantes para MongoDB
// Hace lo mismo que el de PostgreSQL pero con Mongoose
export class RestaurantDAOMongo {

  // Inserta un nuevo documento en la colección restaurants
  async create(nombre, direccion, telefono) {
    const restaurant = new Restaurant({ nombre, direccion, telefono });
    const saved = await restaurant.save();
    return { id: saved._id };
  }

  // Obtiene todos los documentos de la colección
  async findAll() {
    const restaurants = await Restaurant.find();
    // Transforma el formato MongoDB al mismo formato que PostgreSQL
    return restaurants.map(r => ({
      id: r._id,
      nombre: r.nombre,
      direccion: r.direccion,
      telefono: r.telefono
    }));
  }
}