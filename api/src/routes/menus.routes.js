import { Router } from 'express';

// Importa el controlador de menús
import { crear, getById, update, remove } from '../controllers/menus.controller.js';

// Importa los middlewares de autenticación y roles
import { checkJwt } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';

const router = Router();

// Ruta para crear un nuevo menú para un restaurante
// Solo los administradores pueden crear menús
// checkJwt verifica el token, requireRole verifica que sea admin
// POST /menus
router.post('/', checkJwt, requireRole('admin'), crear);
// Obtener menú por ID 
router.get('/:id', checkJwt, getById);

// Actualizar menú (solo admin)
router.put('/:id', checkJwt, requireRole('admin'), update);

// Eliminar menú (solo admin)
router.delete('/:id', checkJwt, requireRole('admin'), remove);

/**
 * @swagger
 * /menus:
 *   post:
 *     summary: Crear un nuevo menú para un restaurante
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, id_restaurante]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Menú del día
 *               id_restaurante:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Menú creado correctamente
 *       403:
 *         description: Permisos insuficientes
 *
 * /menus/{id}:
 *   get:
 *     summary: Obtener detalles de un menú específico
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del menú
 *       404:
 *         description: Menú no encontrado
 *   put:
 *     summary: Actualizar un menú existente
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Menú actualizado
 *     responses:
 *       200:
 *         description: Menú actualizado correctamente
 *       404:
 *         description: Menú no encontrado
 *   delete:
 *     summary: Eliminar un menú
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menú eliminado correctamente
 *       404:
 *         description: Menú no encontrado
 */

export default router;