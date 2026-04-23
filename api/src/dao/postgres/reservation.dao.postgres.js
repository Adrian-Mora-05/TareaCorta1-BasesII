import { ReservationDAO } from '../interfaces/reservationDAO.js';
import { query } from '../../config/db.js';

export class ReservationPostgresDAO extends ReservationDAO {

  async getUserByKeycloakId(keycloakId) {
    const result = await query(
      `SELECT id FROM restaurant.usuario WHERE id_external_auth = $1`,
      [keycloakId]
    );
    return result.rows[0]?.id;
  }

  async create(id_usuario, id_restaurante, id_mesa, fecha, duracion, personas) {
    const result = await query(
      'SELECT restaurant.reservar($1, $2, $3, $4, $5, $6) AS id',
      [id_usuario, id_restaurante, id_mesa, fecha, duracion, personas]
    );
    const id = result.rows[0]?.id ?? result.rows[0]?.reservar;
    if (!id) throw new Error('No se pudo crear la reserva');
    return { id };
  }

  async cancel(id) {
    const check = await query(
      `SELECT id FROM restaurant.reservacion WHERE id = $1`, [id]
    );
    if (check.rowCount === 0) throw new Error('Reserva no encontrada');
    await query('SELECT restaurant.cancelar_reserva($1)', [id]);
  }

  async findById(id) {
    const result = await query(
      `SELECT * FROM restaurant.reservacion WHERE id = $1`, [id]
    );
    return result.rows[0];
  }
}