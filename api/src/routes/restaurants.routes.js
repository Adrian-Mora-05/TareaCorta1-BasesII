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

/**
 * @swagger
 * /restaurants:
 *   post:
 *     summary: Registrar un restaurante (solo administradores)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
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
 *                 example: La Trattoria
 *               direccion:
 *                 type: string
 *                 example: Calle 5, San José
 *               telefono:
 *                 type: string
 *                 example: 2222-3333
 *     responses:
 *       201:
 *         description: Restaurante registrado correctamente
 *       400:
 *         description: Nombre obligatorio
 *       403:
 *         description: Permisos insuficientes
 *   get:
 *     summary: Listar restaurantes disponibles
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de restaurantes
 *       401:
 *         description: Token inválido o ausente
 */

export default router;