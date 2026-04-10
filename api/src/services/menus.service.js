import { query } from '../config/db.js';

// Crea un nuevo menú para un restaurante específico
// Llama a la función SQL crear_menu
export async function crearMenu(nombre, idRestaurante) {
  const result = await query(
    'SELECT restaurant.crear_menu($1, $2) AS id',
    [nombre, idRestaurante]
  );
  // Retorna el ID del menú recién creado
  return result.rows[0];
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