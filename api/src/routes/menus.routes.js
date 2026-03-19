import { Router } from 'express';

// Importa el controlador de menús
import { crear } from '../controllers/menus.controller.js';

// Importa los middlewares de autenticación y roles
import { checkJwt } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';

const router = Router();

// Ruta para crear un nuevo menú para un restaurante
// Solo los administradores pueden crear menús
// checkJwt verifica el token, requireRole verifica que sea admin
// POST /menus
router.post('/', checkJwt, requireRole('admin'), crear);

export default router;