import { Router } from 'express';
import { checkJwt } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';
import { createRestaurant, getRestaurants } from '../controllers/restaurants.controller.js';

const router = Router();

router.post('/', checkJwt, requireRole('admin'), createRestaurant);
router.get('/', getRestaurants);

export default router;