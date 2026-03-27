// Importa la función del servicio de menús
import { crearMenu, getMenuById, updateMenu, deleteMenu } from '../services/menus.service.js';

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

export async function getById(req, res) {
  try {
    const { id } = req.params;

    const menu = await getMenuById(id);

    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }

    res.json(menu);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    // Verificar si existe
    if (!nombre) {
    return res.status(400).json({ error: 'nombre es obligatorio' });
    }
    
    const menu = await getMenuById(id);

    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }



    await updateMenu(id, nombre);

    res.json({ message: 'Menú actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
  
    // Verificar si existe
    const menu = await getMenuById(id);

    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }

    await deleteMenu(id);

    res.json({ message: 'Menú eliminado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}