import { Router } from 'express';
import { create, getById } from '../controllers/orders.controller.js';
import { checkJwt } from '../middlewares/auth.js';

const router = Router();

// Crear pedido
router.post('/', checkJwt, create);

// Obtener pedido
router.get('/:id', checkJwt, getById);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Realizar un pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_restaurante, id_tipo_pedido, platos]
 *             properties:
 *               id_restaurante:
 *                 type: integer
 *                 example: 1
 *               descripcion:
 *                 type: string
 *                 example: Para llevar
 *               id_tipo_pedido:
 *                 type: integer
 *                 example: 1
 *               platos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_plato:
 *                       type: integer
 *                       example: 1
 *                     cantidad:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Pedido creado correctamente
 *       400:
 *         description: Datos incompletos o plato no existe
 *       401:
 *         description: Token inválido o ausente
 *
 * /orders/{id}:
 *   get:
 *     summary: Obtener detalles de un pedido
 *     tags: [Orders]
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
 *         description: Detalles del pedido
 *       404:
 *         description: Pedido no encontrado
 */

export default router;