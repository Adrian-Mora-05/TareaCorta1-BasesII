import Menu from '../../models/menu.model.js';

// DAO de menús para MongoDB
export class MenuDAOMongo {

  // Inserta un nuevo documento en la colección menus
  async create(nombre, idRestaurante) {
    const menu = new Menu({ nombre, id_restaurante: idRestaurante });
    const saved = await menu.save();
    return { id: saved._id };
  }
}