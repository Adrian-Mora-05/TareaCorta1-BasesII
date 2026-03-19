import { Router } from 'express';

// Importa los controladores de restaurantes
import { crear, listar } from '../controllers/restaurants.controller.js';

// Importa los middlewares de autenticación y roles
import { checkJwt } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';

const router = Router();

// Ruta para registrar un nuevo restaurante
// Solo los administradores pueden crear restaurantes
// checkJwt verifica el token, requireRole verifica que sea admin
// POST /restaurants
router.post('/', checkJwt, requireRole('admin'), crear);

// Ruta para listar todos los restaurantes disponibles
// Cualquier usuario autenticado puede ver los restaurantes
// checkJwt verifica que haya un token válido
// GET /restaurants
router.get('/', checkJwt, listar);

export default router;