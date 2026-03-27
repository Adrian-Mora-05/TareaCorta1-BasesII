// Importa las funciones del servicio de autenticación
import { registrarUsuario, loginUser } from '../services/auth.service.js';

// Controlador para registrar un nuevo usuario
// Maneja la petición POST /auth/register
export async function register(req, res) {
  try {
    // Extrae los datos del body de la petición
    const { username, email, firstName, lastName, password, role } = req.body;

    // Verifica que todos los campos obligatorios estén presentes
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email y password son obligatorios' });
    }

    // Si pide rol admin, verifica que quien registra sea admin
    if (role === 'admin') {
      const tokenRoles = req.auth?.roles || req.auth?.realm_access?.roles || [];
      if (!tokenRoles.includes('admin')) {
        return res.status(403).json({ error: 'Solo admins pueden crear otros admins' });
      }
    }

    const rolFinal = ['cliente', 'admin'].includes(role) ? role : 'cliente';
    await registrarUsuario({ username, email, firstName, lastName, password, role: rolFinal });


    // Responde con 201 Created si todo salió bien
    res.status(201).json({ message: 'Usuario registrado correctamente' });

  } catch (error) {
    // Si algo falla, responde con 500 y el mensaje de error
    res.status(500).json({ error: error.message });
  }
}

// Controlador para hacer login y obtener un token JWT
// Maneja la petición POST /auth/login
export async function login(req, res) {
  try {
    // Extrae usuario y contraseña del body
    const { username, password } = req.body;

    // Verifica que ambos campos estén presentes
    if (!username || !password) {
      return res.status(400).json({ error: 'username y password son obligatorios' });
    }

    // Llama al servicio para hacer login en Keycloak
    const tokenData = await loginUser(username, password);

    // Responde con el token JWT completo
    res.status(200).json(tokenData);

} catch (error) {
  // loginUser lanza 'Credenciales inválidas' solo cuando Keycloak rechaza
    const status = error.message === 'Credenciales inválidas' ? 401 : 500;
    res.status(status).json({ error: error.message });
}
}