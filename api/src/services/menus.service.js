import { getMenuDAO } from '../dao/dao.factory.js';

// Crea un nuevo menú para un restaurante específico
// Llama a la función SQL crear_menu
export async function crearMenu(nombre, idRestaurante) {
  const dao = getMenuDAO();
  return await dao.create(nombre, idRestaurante);
}

// Obtener detalles de un menú
export async function getMenuById(id) {
  const result = await query(
    'SELECT * FROM restaurant.get_detalles_menu($1)',
    [id]
  );
  return result.rows[0];
}

// Actualizar menú
export async function updateMenu(id, nombre) {
  await query(
    'SELECT restaurant.actualizar_menu($1, $2)',
    [id, nombre]
  );
}

// Eliminar menú
export async function deleteMenu(id) {
  await query(
    'SELECT restaurant.borrar_menu($1)',
    [id]
  );
}