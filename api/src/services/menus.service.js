
import { getMenuDAO } from '../dao/DAOFactory.js';
import { getCache, setCache, deletePattern, TTL } from '../config/cache.js';


export async function crearMenu(nombre, idRestaurante) {
  const dao = getMenuDAO();
  const result = await dao.create(nombre, idRestaurante);

  // Borra el caché de menús de ese restaurante
  await deletePattern(`menus:${idRestaurante}:*`);

  return result;
}

export async function getMenuById(id) {
  const cacheKey = `menus:${idRestaurante}:all`;

  // Busca en caché primero
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log('Menús desde caché');
    return cached;
  }

  // Si no está, va a la base de datos
  const dao = getMenuDAO();
  const result = await dao.findById(id);

  // Guarda en Redis por 3 minutos
  await setCache(cacheKey, result, TTL.MENUS);

  return result;

}

export async function updateMenu(id, nombre) {
  const dao = getMenuDAO();
  await dao.update(id, nombre);

  // Borra el caché de menús de ese restaurante
  // porque los datos cambiaron
  await deletePattern(`menus:${idRestaurante}:*`);
}

export async function deleteMenu(id) {
  const dao = getMenuDAO();
  await dao.delete(id);

  // Borra el caché de menús de ese restaurante
  // porque un menu fue eliminado
  await deletePattern(`menus:${idRestaurante}:*`);
}