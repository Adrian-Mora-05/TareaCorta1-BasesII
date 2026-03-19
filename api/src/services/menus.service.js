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