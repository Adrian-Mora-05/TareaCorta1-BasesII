import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock del caché — ahora el service solo usa deletePattern
const mockDeletePattern = jest.fn();

jest.unstable_mockModule('../../src/config/cache.js', () => ({
  deletePattern: mockDeletePattern,
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
  TTL: { RESTAURANTS: 86400, MENUS: 3600, SEARCH: 60 }
}));

const mockRestaurantDAO = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

const { RestaurantService } = await import('../../src/services/restaurants.service.js');

const restaurantService = new RestaurantService(mockRestaurantDAO);

describe('RestaurantService', () => {

  beforeEach(() => jest.clearAllMocks());

  test('create - registra restaurante y limpia caché', async () => {
    mockRestaurantDAO.create.mockResolvedValue({ id: 1, nombre: 'La Trattoria' });
    mockDeletePattern.mockResolvedValue();

    const result = await restaurantService.create({
      nombre: 'La Trattoria',
      direccion: 'Cartago',
      telefono: '2550-1234'
    });

    expect(mockRestaurantDAO.create).toHaveBeenCalled();
    // Verifica que invalida el caché al crear
    expect(mockDeletePattern).toHaveBeenCalledWith('restaurants:*');
    expect(result).toHaveProperty('id', 1);
  });

  test('create - lanza error si falta el nombre', async () => {
    await expect(restaurantService.create({ direccion: 'Cartago' }))
      .rejects.toThrow('El nombre del restaurante es obligatorio');

    expect(mockRestaurantDAO.create).not.toHaveBeenCalled();
  });

  test('findAll - llama al DAO directamente sin caché', async () => {
    // El service ya no maneja caché en findAll — eso lo hace cacheMiddleware
    mockRestaurantDAO.findAll.mockResolvedValue([
      { id: 1, nombre: 'La Trattoria' }
    ]);

    const result = await restaurantService.findAll();

    expect(mockRestaurantDAO.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

});