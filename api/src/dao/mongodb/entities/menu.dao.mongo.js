import { MongoBaseDAO } from '../MongoBaseDAO.js';

/**
 * MenuDAOMongo — DAO de menús para MongoDB.
 *
 * Cambios respecto al código anterior:
 *  - Extiende MongoBaseDAO (recibe db por inyección, no llama getMongo())
 *  - create recibe objeto data — cumple contrato BaseDAO
 *  - update recibe objeto data — cumple contrato BaseDAO
 *  - update retorna el documento actualizado (antes no retornaba nada)
 *  - delete retorna boolean (antes lanzaba error si no existía — eso es del servicio)
 *  - Agrega timestamp ultima_actualizacion en create y update
 */
export class MenuDAOMongo extends MongoBaseDAO {
  constructor(db) {
    super(db, 'menus');
  }

  /**
   * @param {{ nombre: string, id_restaurante: string }} data
   * @returns {Promise<Object>}
   */
  async create({ nombre, id_restaurante }) {
    return super.create({
      nombre,
      id_restaurante,
      ultima_actualizacion: new Date(),
    });
  }

  /**
   * @param {string} id
   * @param {{ nombre: string }} data
   * @returns {Promise<Object|null>}
   */
  async update(id, { nombre }) {
    return super.update(id, {
      nombre,
      ultima_actualizacion: new Date(),
    });
  }

  /**
   * Retorna todos los menús de un restaurante.
   * @param {string} idRestaurante
   * @returns {Promise<Array>}
   */
  async findByRestaurant(idRestaurante) {
    return this.findBy({ id_restaurante: idRestaurante });
  }
}