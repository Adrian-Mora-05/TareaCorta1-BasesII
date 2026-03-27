// Importa Router de Express para definir rutas de forma modular
import { Router } from 'express';

// Importa los controladores de autenticación
import { register, login } from '../controllers/auth.controller.js';

import { optionalJwt } from '../middlewares/auth.js'; // importa el opcional

// Crea una instancia del router
const router = Router();

// Ruta pública para registrar un nuevo usuario
// No necesita token porque el usuario aún no existe
// POST /auth/register


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de un nuevo usuario
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: juanito
 *               email:
 *                 type: string
 *                 example: juanito@test.com
 *               firstName:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: Pérez
 *               password:
 *                 type: string
 *                 example: mipass123
 *               role:
 *                 type: string
 *                 enum: [cliente, admin]
 *                 example: cliente
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Campos obligatorios faltantes
 *       403:
 *         description: Solo admins pueden crear otros admins
 */
router.post('/register', optionalJwt, register);

// Ruta pública para hacer login y obtener el token JWT
// No necesita token porque el usuario está intentando obtenerlo
// POST /auth/login

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicio de sesión y obtención de JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin2
 *               password:
 *                 type: string
 *                 example: admin456
 *     responses:
 *       200:
 *         description: Token JWT generado correctamente
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', login);

// Exporta el router para que app.js lo pueda usar
export default router;