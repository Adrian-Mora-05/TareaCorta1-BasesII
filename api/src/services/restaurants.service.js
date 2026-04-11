import { getRestaurantDAO } from '../dao/dao.factory.js';


// Registra un nuevo restaurante en la base de datos
// Solo los administradores pueden llamar esta función (eso se controla en la ruta)
export async function registrarRestaurante(nombre, direccion, telefono) {
  const dao = getRestaurantDAO();
  return await dao.create(nombre, direccion, telefono);
  
}

// Obtiene la lista de todos los restaurantes disponibles
export async function listarRestaurantes() {
  const dao = getRestaurantDAO();
  return await dao.findAll();
}