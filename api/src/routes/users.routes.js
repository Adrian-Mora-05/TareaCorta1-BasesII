import { Router } from 'express';

// Importa los controladores de usuarios
import { getMe, update, remove } from '../controllers/users.controller.js';

// Importa el middleware que verifica el token JWT
import { checkJwt } from '../middlewares/auth.js';

// Importa el middleware que verifica el rol del usuario
import { requireRole } from '../middlewares/roles.js';

const router = Router();

// Ruta para obtener el perfil del usuario autenticado
// checkJwt verifica que el token sea válido antes de continuar
// GET /users/me
router.get('/me', checkJwt, getMe);

// Ruta para actualizar los datos de un usuario
// Solo un administrador puede actualizar cualquier usuario
// checkJwt primero verifica el token, luego requireRole verifica que sea admin
// PUT /users/:id
router.put('/:id', checkJwt, requireRole('admin'), update);

// Ruta para eliminar un usuario
// Solo un administrador puede eliminar usuarios
// DELETE /users/:id
router.delete('/:id', checkJwt, requireRole('admin'), remove);

export default router;