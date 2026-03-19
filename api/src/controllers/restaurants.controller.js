// Importa las funciones del servicio de restaurantes
import { registrarRestaurante, listarRestaurantes } from '../services/restaurants.service.js';

// Controlador para registrar un nuevo restaurante
// Maneja la petición POST /restaurants
// Solo accesible para administradores (se controla en la ruta)
export async function crear(req, res) {
  try {
    // Extrae los datos del restaurante del body
    const { nombre, direccion, telefono } = req.body;

    // Verifica que el nombre esté presente (es el único campo obligatorio)
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del restaurante es obligatorio' });
    }

    // Llama al servicio para registrar el restaurante en la base de datos
    const result = await registrarRestaurante(nombre, direccion, telefono);

    // Responde con 201 Created y el ID del restaurante creado
    res.status(201).json({ message: 'Restaurante registrado correctamente', id: result.id });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controlador para listar todos los restaurantes disponibles
// Maneja la petición GET /restaurants
// Accesible para cualquier usuario autenticado
export async function listar(req, res) {
  try {
    // Llama al servicio para obtener todos los restaurantes
    const restaurantes = await listarRestaurantes();

    // Responde con el arreglo de restaurantes
    res.status(200).json(restaurantes);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}