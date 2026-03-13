import * as restaurantsService from '../services/restaurants.service.js';

export async function createRestaurant(req, res) {
  try {
    const { nombre, direccion, telefono } = req.body;
    if (!nombre) return res.status(400).json({ error: "nombre es obligatorio" });

    const restaurant = await restaurantsService.createRestaurant(nombre, direccion, telefono);
    res.status(201).json({ message: "Restaurante creado", id: restaurant.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando restaurante" });
  }
}

export async function getRestaurants(req, res) {
  try {
    const restaurants = await restaurantsService.getRestaurants();
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo restaurantes" });
  }
}