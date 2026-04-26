   /* Para agregar soporte a un nuevo motor de base de datos:
 *  1. Crear una carpeta nueva en /dao/<motor>/
 *  2. Crear un <Entidad>DAO que extienda BaseDAO.
 *  3. Registrarlo en DAOFactory.js con su clave de configuración.
 *  ¡No se modifica ningún otro archivo!
 */
class BaseDAO {
  /**
   * Obtiene todos los registros de la entidad.
   * @returns {Promise<Array>}
   */
  async findAll() {
    throw new Error(`${this.constructor.name} must implement findAll()`);
  }
 
  /**
   * Obtiene un registro por su identificador único.
   * @param {string|number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error(`${this.constructor.name} must implement findById()`);
  }
 
  /**
   * Crea un nuevo registro.
   * @param {Object} data — Datos del nuevo registro.
   * @returns {Promise<Object>} — El registro creado.
   */
  async create(data) {
    throw new Error(`${this.constructor.name} must implement create()`);
  }
 
  /**
   * Actualiza un registro existente.
   * @param {string|number} id
   * @param {Object} data — Campos a actualizar.
   * @returns {Promise<Object|null>} — El registro actualizado.
   */
  async update(id, data) {
    throw new Error(`${this.constructor.name} must implement update()`);
  }
 
  /**
   * Elimina un registro por su identificador.
   * @param {string|number} id
   * @returns {Promise<boolean>} — true si se eliminó, false si no existía.
   */
  async delete(id) {
    throw new Error(`${this.constructor.name} must implement delete()`);
  }
 
  /**
   * Busca registros que coincidan con los criterios dados.
   * @param {Object} criteria — Pares clave-valor para filtrar.
   * @returns {Promise<Array>}
   */
  async findBy(criteria) {
    throw new Error(`${this.constructor.name} must implement findBy()`);
  }
}
 
module.exports = BaseDAO;