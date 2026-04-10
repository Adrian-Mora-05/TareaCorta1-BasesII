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
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener detalles del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: Token inválido o ausente
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/me', checkJwt, getMe);

// Ruta para actualizar los datos de un usuario
// Solo un administrador puede actualizar cualquier usuario
// checkJwt primero verifica el token, luego requireRole verifica que sea admin
// PUT /users/:id
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar información de un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Actualizado
 *               correo:
 *                 type: string
 *                 example: nuevo@correo.com
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       400:
 *         description: Campos obligatorios faltantes
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', checkJwt, requireRole('admin'), update);

// Ruta para eliminar un usuario
// Solo un administrador puede eliminar usuarios
// DELETE /users/:id
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', checkJwt, requireRole('admin'), remove);

export default router;