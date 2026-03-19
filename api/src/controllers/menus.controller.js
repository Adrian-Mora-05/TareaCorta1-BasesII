// Importa la función del servicio de menús
import { crearMenu } from '../services/menus.service.js';

// Controlador para crear un nuevo menú
// Maneja la petición POST /menus
export async function crear(req, res) {
  try {
    // Extrae el nombre del menú y el ID del restaurante del body
    const { nombre, id_restaurante } = req.body;

    // Verifica que ambos campos estén presentes
    if (!nombre || !id_restaurante) {
      return res.status(400).json({ error: 'nombre e id_restaurante son obligatorios' });
    }

    // Llama al servicio para crear el menú en la base de datos
    const result = await crearMenu(nombre, id_restaurante);

    // Responde con 201 Created y el ID del menú creado
    res.status(201).json({ message: 'Menú creado correctamente', id: result.id });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}