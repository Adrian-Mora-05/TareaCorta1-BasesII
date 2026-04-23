import { getOrderDAO } from '../dao/dao.factory.js';

export async function createOrder(keycloakId, id_restaurante, descripcion, tipo_pedido, platos) {
  const dao = getOrderDAO();

  const id_usuario = await dao.getUserByKeycloakId(keycloakId);
  if (!id_usuario) throw new Error('Usuario no encontrado en base de datos');

  const restauranteExiste = await dao.validateRestaurant(id_restaurante);
  if (!restauranteExiste) throw new Error(`Restaurante ${id_restaurante} no existe`);

  return await dao.create(id_usuario, id_restaurante, descripcion, tipo_pedido, platos);
}

export async function getOrderById(id) {
  const dao = getOrderDAO();
  return await dao.findById(id);
}