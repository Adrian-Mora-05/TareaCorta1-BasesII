import { getCache, setCache, deletePattern, TTL } from '../config/cache.js';

/**
 * RestaurantService — Lógica de negocio para restaurantes.
 *
 * Cambios respecto al código anterior:
 *  - Era módulo de funciones sueltas con getRestaurantDAO() global; ahora clase inyectable
 *  - create recibe objeto { nombre, direccion, telefono } en vez de parámetros posicionales
 *  - Lógica de caché Redis se mantiene aquí (es decisión del servicio, no del DAO)
 */
export class RestaurantService {
  /**
   * @param {import('../dao/interfaces/BaseDAO.js').BaseDAO} restaurantDAO
   */
  constructor(restaurantDAO) {
    this.dao = restaurantDAO;
  }

  /**
   * Registra un restaurante y limpia el caché de lista.
   *
   * @param {{ nombre: string, direccion?: string, telefono?: string }} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    if (!data.nombre) throw new Error('El nombre del restaurante es obligatorio');
    const result = await this.dao.create(data);
    await deletePattern('restaurants:*');
    return result;
  }

  /**
   * Lista todos los restaurantes, con caché de Redis.
   *
   * @returns {Promise<Array>}
   */
  async findAll() {
    const cacheKey = 'restaurants:all';
    const cached = await getCache(cacheKey);

    if (cached) {
      console.log('Restaurantes desde caché');
      return cached;
    }

    const result = await this.dao.findAll();
    await setCache(cacheKey, result, TTL.RESTAURANTS);
    return result;
  }
}