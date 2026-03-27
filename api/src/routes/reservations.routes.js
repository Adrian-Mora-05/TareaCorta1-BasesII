import { Router } from 'express';
import { create, remove } from '../controllers/reservations.controller.js';
import { checkJwt } from '../middlewares/auth.js';

const router = Router();

// Crear reserva (cliente autenticado)
router.post('/', checkJwt, create);

// Cancelar reserva
router.delete('/:id', checkJwt, remove);

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Crear una nueva reserva
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_restaurante, id_mesa, fecha_hora, duracion, cant_personas]
 *             properties:
 *               id_restaurante:
 *                 type: integer
 *                 example: 1
 *               id_mesa:
 *                 type: integer
 *                 example: 1
 *               fecha_hora:
 *                 type: string
 *                 example: "2026-04-01T19:00:00"
 *               duracion:
 *                 type: integer
 *                 example: 90
 *               cant_personas:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Reserva creada correctamente
 *       400:
 *         description: Datos incompletos
 *       409:
 *         description: La mesa ya está reservada en ese horario
 *
 * /reservations/{id}:
 *   delete:
 *     summary: Cancelar una reserva
 *     tags: [Reservations]
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
 *         description: Reserva cancelada correctamente
 *       404:
 *         description: Reserva no encontrada
 */


export default router;