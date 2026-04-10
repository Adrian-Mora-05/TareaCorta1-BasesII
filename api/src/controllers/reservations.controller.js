import { createReservation, cancelReservation } from '../services/reservations.service.js';

export async function create(req, res) {
  try {
    const {
      id_restaurante,
      id_mesa,
      fecha_hora,
      duracion,
      cant_personas
    } = req.body;

    if (!id_restaurante || !id_mesa || !fecha_hora || !duracion || !cant_personas) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const keycloakId = req.auth?.sub; 

    const result = await createReservation(
      keycloakId,
      id_restaurante,
      id_mesa,
      fecha_hora,
      duracion,
      cant_personas
    );

    res.status(201).json({
      message: 'Reserva creada correctamente',
      id: result.id
    });

  } catch (error) {

    // manejo de error de conflicto (desde PostgreSQL)
    if (error.message.includes('ya está reservada')) {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;

    await cancelReservation(id);

    res.json({ message: 'Reserva cancelada correctamente' });

  } catch (error) {
    const status = error.message === 'Reserva no encontrada' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
}