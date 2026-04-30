import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock del caché para no conectarse a Redis real
const mockGetCache = jest.fn();
const mockSetCache = jest.fn();
const mockDeletePattern = jest.fn();

jest.unstable_mockModule('../../src/config/cache.js', () => ({
  getCache: mockGetCache,
  setCache: mockSetCache,
  deletePattern: mockDeletePattern,
  deleteCache: jest.fn(),
  TTL: { RESTAURANTS: 300, MENUS: 180, SEARCH: 60 }
}));

// Mock del restaurantDAO inyectado en RestaurantService
const mockRestaurantDAO = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

const { RestaurantService } = await import('../../src/services/restaurants.service.js');

// Instancia con el DAO y caché mockeados
const restaurantService = new RestaurantService(mockRestaurantDAO);

describe('RestaurantService', () => {

  beforeEach(() => jest.clearAllMocks());

  // ── create ────────────────────────────────────────────────

  test('create - registra restaurante y limpia caché', async () => {
    mockRestaurantDAO.create.mockResolvedValue({ id: 1, nombre: 'La Trattoria' });
    mockDeletePattern.mockResolvedValue();

    const result = await restaurantService.create({
      nombre: 'La Trattoria',
      direccion: 'Cartago',
      telefono: '2550-1234'
    });

    expect(mockRestaurantDAO.create).toHaveBeenCalledWith({
      nombre: 'La Trattoria',
      direccion: 'Cartago',
      telefono: '2550-1234'
    });
    // Verifica que se limpió el caché después de crear
    expect(mockDeletePattern).toHaveBeenCalledWith('restaurants:*');
    expect(result).toHaveProperty('id', 1);
  });

  test('create - lanza error si falta el nombre', async () => {
    await expect(restaurantService.create({ direccion: 'Cartago' }))
      .rejects.toThrow('El nombre del restaurante es obligatorio');

    // No debe llamar al DAO si falta el nombre
    expect(mockRestaurantDAO.create).not.toHaveBeenCalled();
  });

  // ── findAll ───────────────────────────────────────────────

  test('findAll - retorna datos desde caché si existen', async () => {
    // Simula que Redis tiene los datos
    mockGetCache.mockResolvedValue([{ id: 1, nombre: 'La Trattoria' }]);

    const result = await restaurantService.findAll();

    // Verifica que NO fue a la base de datos
    expect(mockRestaurantDAO.findAll).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('nombre', 'La Trattoria');
  });

  test('findAll - va a la BD y guarda en caché si no hay datos en Redis', async () => {
    // Redis no tiene datos
    mockGetCache.mockResolvedValue(null);
    mockRestaurantDAO.findAll.mockResolvedValue([
      { id: 1, nombre: 'La Trattoria' },
      { id: 2, nombre: 'El Fogón' }
    ]);
    mockSetCache.mockResolvedValue();

    const result = await restaurantService.findAll();

    // Verifica que fue a la base de datos
    expect(mockRestaurantDAO.findAll).toHaveBeenCalled();
    // Verifica que guardó en caché con el TTL correcto
    expect(mockSetCache).toHaveBeenCalledWith(
      'restaurants:all',
      expect.any(Array),
      300
    );
    expect(result).toHaveLength(2);
  });

  test('findAll - retorna lista vacía si no hay restaurantes', async () => {
    mockGetCache.mockResolvedValue(null);
    mockRestaurantDAO.findAll.mockResolvedValue([]);
    mockSetCache.mockResolvedValue();

    const result = await restaurantService.findAll();

    expect(result).toEqual([]);
  });

});