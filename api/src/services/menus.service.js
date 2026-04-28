import { getCache, setCache, deletePattern, TTL } from '../config/cache.js';

/**
 * MenuService — Lógica de negocio para menús.
 *
 */
export class MenuService {
  /**
   * @param {import('../dao/interfaces/BaseDAO.js').BaseDAO} menuDAO
   */
  constructor(menuDAO) {
    this.dao = menuDAO;
  }

  /**
   * Crea un menú y limpia el caché del restaurante asociado.
   *
   * @param {{ nombre: string, id_restaurante: string|number }} data
   * @returns {Promise<Object>}
   */
  async create({ nombre, id_restaurante }) {
    if (!nombre || !id_restaurante) {
      throw new Error('nombre e id_restaurante son obligatorios');
    }

    const result = await this.dao.create({ nombre, id_restaurante });
    await deletePattern(`menus:${id_restaurante}:*`);
    return result;
  }

  /**
   * Obtiene un menú por ID con caché Redis.
   * La clave de caché es por menú individual, no por restaurante.
   *
   * @param {string|number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const cacheKey = `menus:item:${id}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      console.log(`Menú ${id} desde caché`);
      return cached;
    }

    const result = await this.dao.findById(id);
    if (result) {
      await setCache(cacheKey, result, TTL.MENUS);
    }

    return result ?? null;
  }

  /**
   * Actualiza un menú y limpia su caché individual y el del restaurante.
   *
   * @param {string|number} id
   * @param {{ nombre: string }} data
   * @returns {Promise<Object>}
   */
  async update(id, { nombre }) {
    if (!nombre) throw new Error('nombre es obligatorio');

    const menu = await this.dao.findById(id);
    if (!menu) throw new Error('Menú no encontrado');

    const updated = await this.dao.update(id, { nombre });

    // Limpia caché individual y del restaurante al que pertenece
    await deletePattern(`menus:item:${id}`);
    await deletePattern(`menus:${menu.id_restaurante}:*`);

    return updated;
  }

  /**
   * Elimina un menú y limpia su caché.
   *
   * @param {string|number} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const menu = await this.dao.findById(id);
    if (!menu) throw new Error('Menú no encontrado');

    await this.dao.delete(id);

    await deletePattern(`menus:item:${id}`);
    await deletePattern(`menus:${menu.id_restaurante}:*`);

    return true;
  }

  /**
   * Lista todos los menús de un restaurante con caché.
   *
   * @param {string|number} idRestaurante
   * @returns {Promise<Array>}
   */
  async findByRestaurant(idRestaurante) {
    const cacheKey = `menus:${idRestaurante}:all`;

    const cached = await getCache(cacheKey);
    if (cached) {
      console.log(`Menús del restaurante ${idRestaurante} desde caché`);
      return cached;
    }

    const result = await this.dao.findByRestaurant(idRestaurante);
    await setCache(cacheKey, result, TTL.MENUS);
    return result;
  }
}