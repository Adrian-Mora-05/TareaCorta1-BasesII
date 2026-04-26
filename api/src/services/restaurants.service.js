
import { getCache, setCache, deletePattern, TTL } from '../config/cache.js';

import { getRestaurantDAO } from '../dao/DAOFactory.js';


// Registra un nuevo restaurante en la base de datos
// Solo los administradores pueden llamar esta función (eso se controla en la ruta)
export async function registrarRestaurante(nombre, direccion, telefono) {
  const dao = getRestaurantDAO();
  const result = await dao.create(nombre, direccion, telefono);
  
  // Cuando se crea un restaurante nuevo, borra el caché de la lista
  // para que la próxima consulta traiga datos actualizados
  await deletePattern('restaurants:*');

  return result;
}

// Obtiene la lista de todos los restaurantes disponibles
export async function listarRestaurantes() {
  // Clave única para identificar este dato en Redis
  const cacheKey = 'restaurants:all';

  // Primero busca en Redis
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log('Restaurantes desde caché');
    return cached;
  }

  // Si no está en caché, va a la base de datos

  const dao = getRestaurantDAO();
  const result = await dao.findAll();

  // Guarda el resultado en Redis por 5 minutos
  await setCache(cacheKey, result, TTL.RESTAURANTS);

  return result;
}