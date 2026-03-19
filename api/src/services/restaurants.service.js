import { query } from '../config/db.js';

// Registra un nuevo restaurante en la base de datos
// Solo los administradores pueden llamar esta función (eso se controla en la ruta)
export async function registrarRestaurante(nombre, direccion, telefono) {
  const result = await query(
    'SELECT restaurant.registrar_restaurante($1, $2, $3) AS id',
    [nombre, direccion, telefono]
  );
  // Retorna el ID del restaurante recién creado
  return result.rows[0];
}

// Obtiene la lista de todos los restaurantes disponibles
// Llama a la función SQL listar_restaurantes
export async function listarRestaurantes() {
  const result = await query(
    'SELECT * FROM restaurant.listar_restaurantes()'
  );
  // Retorna todas las filas como un arreglo
  return result.rows;
}