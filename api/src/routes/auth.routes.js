// Importa Router de Express para definir rutas de forma modular
import { Router } from 'express';

// Importa los controladores de autenticación
import { register, login } from '../controllers/auth.controller.js';

// Crea una instancia del router
const router = Router();

// Ruta pública para registrar un nuevo usuario
// No necesita token porque el usuario aún no existe
// POST /auth/register
router.post('/register', register);

// Ruta pública para hacer login y obtener el token JWT
// No necesita token porque el usuario está intentando obtenerlo
// POST /auth/login
router.post('/login', login);

// Exporta el router para que app.js lo pueda usar
export default router;