import { createOrder, getOrderById } from '../services/orders.service.js';

export async function create(req, res) {
  try {
    const {
      id_restaurante,
      descripcion,
      id_tipo_pedido,
      platos
    } = req.body;

    if (!id_restaurante || !id_tipo_pedido || !platos || platos.length === 0) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const keycloakId = req.auth?.sub; // viene del JWT

    const result = await createOrder(
      keycloakId,
      id_restaurante,
      descripcion,
      id_tipo_pedido,
      platos
    );

    // 🔹 Protección extra por si result es undefined
    if (!result || !result.id) {
      return res.status(500).json({ error: 'No se pudo crear el pedido' });
    }

    res.status(201).json({
      message: 'Pedido creado correctamente',
      id: result.id
    });

  } catch (error) {

    if (error.message.includes('no existe')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params;

    const order = await getOrderById(id);

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}