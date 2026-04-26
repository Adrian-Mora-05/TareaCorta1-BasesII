import { MongoBaseDAO } from '../MongoBaseDAO.js';

/**
 * UserDAOMongo — DAO de usuarios para MongoDB.
 *
 * Igual que en Postgres, existe una colección local `usuarios` que
 * almacena datos complementarios referenciados por el ID de Keycloak.
 *
 * Cambios respecto al código anterior:
 *  - Extiende MongoBaseDAO (recibe db por inyección)
 *  - update recibe objeto data — cumple contrato BaseDAO
 *  - update y delete retornan boolean/datos, no mensajes
 *    (los mensajes son responsabilidad del controlador)
 */
export class UserDAOMongo extends MongoBaseDAO {
  constructor(db) {
    super(db, 'usuarios');
  }

  /**
   * Busca el usuario local por su ID de Keycloak.
   * Usado en GET /users/me.
   *
   * @param {string} keycloakId
   * @returns {Promise<Object|null>}
   */
  async findByExternalId(keycloakId) {
    const doc = await this.collection.findOne({ id_external_auth: keycloakId });
    return this._normalize(doc);
  }

  /**
   * Actualiza solo los campos permitidos del perfil local.
   *
   * @param {string} id
   * @param {{ nombre?: string, correo?: string }} data
   * @returns {Promise<Object|null>}
   */
  async update(id, { nombre, correo }) {
    const fields = {};
    if (nombre !== undefined) fields.nombre = nombre;
    if (correo !== undefined) fields.correo = correo;

    if (Object.keys(fields).length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    return super.update(id, fields);
  }
}