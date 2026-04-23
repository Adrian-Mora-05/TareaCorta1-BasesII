import { getMenuDAO } from '../dao/dao.factory.js';

export async function crearMenu(nombre, idRestaurante) {
  const dao = getMenuDAO();
  return await dao.create(nombre, idRestaurante);
}

export async function getMenuById(id) {
  const dao = getMenuDAO();
  return await dao.findById(id);
}

export async function updateMenu(id, nombre) {
  const dao = getMenuDAO();
  await dao.update(id, nombre);
}

export async function deleteMenu(id) {
  const dao = getMenuDAO();
  await dao.delete(id);
}