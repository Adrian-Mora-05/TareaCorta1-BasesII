import { getReservationDAO } from '../dao/dao.factory.js';

export async function createReservation(keycloakId, id_restaurante, id_mesa, fecha, duracion, personas) {
  const dao = getReservationDAO();

  const id_usuario = await dao.getUserByKeycloakId(keycloakId);
  if (!id_usuario) throw new Error('Usuario no encontrado en base de datos');

  return await dao.create(id_usuario, id_restaurante, id_mesa, fecha, duracion, personas);
}

export async function cancelReservation(id) {
  const dao = getReservationDAO();
  await dao.cancel(id);
}